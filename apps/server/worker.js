import { Worker } from 'bullmq'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import dotenv from 'dotenv'
import path from 'path'
import { getVectorStore } from './lib/vectorStore'
import pdfRepository from './repositories/pdf.repository'

dotenv.config({ path: path.resolve(__dirname, '.env') })
dotenv.config()

const vectorStore = await getVectorStore()

console.log(`Worker starting on REDIS_HOST=${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`)
const BATCH_SIZE = process.env.WORKER_BATCH_SIZE || 10 // limited by Gemini's rate limit
const MAX_RETRIES = process.env.WORKER_MAX_RETRIES || 2
const BASE_DELAY_MS = process.env.WORKER_BASE_DELAY_MS || 5000

function sleep(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms))
}

async function upsertBatchWithRetry(vectorStore, batch, batchLabel) {
   for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
         await vectorStore.addDocuments(batch) // embeds via Gemini, then writes to local Qdrant
         return true
      } catch (e) {
         const isLastAttempt = attempt === MAX_RETRIES
         const backoff = BASE_DELAY_MS * Math.pow(2, attempt - 1)
         console.warn(
            `${batchLabel} attempt ${attempt}/${MAX_RETRIES} failed: ${e.message}` +
               (isLastAttempt ? '' : ` — retrying in ${backoff}ms`),
         )
         if (isLastAttempt) return false
         await sleep(backoff)
      }
   }
   return false
}

async function embedAndUpsertInBatches(vectorStore, docs) {
   const failedDocs = []

   for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE)
      const label = `Batch ${i}-${i + batch.length}`
      console.log(`${label} of ${docs.length}`)

      const ok = await upsertBatchWithRetry(vectorStore, batch, label)
      if (!ok) failedDocs.push(...batch)

      await sleep(1500) // pacing for Gemini rate limit
   }

   return failedDocs
}

const worker = new Worker(
   'pdf-rag-upload-queue',
   async (job) => {
      console.log('Processing job:', job.id, job.data)
      const data = typeof job.data === 'string' ? JSON.parse(job.data) : job.data
      try {
         const filePath = path.resolve(__dirname, data?.path)
         if (!filePath) {
            throw new Error(`Job ${job.id} does not contain a valid file path.`)
         }
         console.log('Loading PDF from:', filePath)
         const loader = new PDFLoader(filePath)
         const docs = await loader.load()
         console.log(`Loaded ${docs.length} document chunk(s).`)

         // Enrich chunk metadata with userId, pdfId, and filename
         docs.forEach((doc) => {
            doc.metadata = {
               ...doc.metadata,
               userId: data.userId || '',
               pdfId: data.pdfId || '',
               source: data.name || data.filename,
               filename: data.filename,
            }
         })

         const failedDocs = await embedAndUpsertInBatches(vectorStore, docs)

         if (failedDocs.length > 0) {
            console.warn(`Job ${job.id}: ${failedDocs.length} chunks failed to insert into Qdrant.`)
         }

         if (data.pdfId) {
            await pdfRepository.updatePdfStatus(data.pdfId, 'Success')
         }

         console.log(`Indexed PDF into Qdrant collection 'pdf-rag' for job ${job.id}`)
      } catch (e) {
         console.error('Error processing job:', e)
         if (data?.pdfId) {
            await pdfRepository.updatePdfStatus(data.pdfId, 'Failed Upload').catch(() => {})
         }
         throw e
      }
   },
   {
      concurrency: 1,
      connection: {
         host: process.env.REDIS_HOST || 'localhost',
         port: Number(process.env.REDIS_PORT) || 6379,
      },
   },
)

worker.on('ready', () => {
   console.log('Worker connected and ready to process jobs')
})

worker.on('error', (err) => {
   console.error('Worker error:', err)
})
