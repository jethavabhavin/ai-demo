import { Worker } from 'bullmq'

console.log(`Worker starting on REDIS_HOST=${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`)

const worker = new Worker(
   'pdf-rag-upload-queue',
   async (job) => {
      console.log('Processing job:', job.id, job.data)
   },
   {
      concurrency: 100,
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
