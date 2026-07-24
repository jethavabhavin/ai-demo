import { conversationRepository } from '../repositories/conversition.repositor'
import { Queue } from 'bullmq'
import { getVectorStore } from '../lib/vectorStore'
import genai from '../lib/genai'
import pdfRepository from '../repositories/pdf.repository'
import type { ReferencePdf, ChatResponse } from '../types/chat.types'

export type { ReferencePdf, ChatResponse }

const vectorStore = await getVectorStore()

const queue = new Queue('pdf-rag-upload-queue', {
   connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
   },
})

export const chatService = {
   async sendMessage(prompt: string, convId: string): Promise<ChatResponse> {
      if (!genai) {
         throw new Error('Google Generative AI client is not initialized. Please verify GEMINI_API_KEY in .env.')
      }

      const model = genai.getGenerativeModel({ model: 'gemini-3.6-flash' })
      const result = await model.generateContent(prompt)
      const answer = result.response.text() ?? ''
      const id = crypto.randomUUID()
      conversationRepository.setLastResponseId(convId, id)
      return { id, message: answer }
   },

   async sendPDfRagMessage(prompt: string, convId: string, userId: string): Promise<ChatResponse> {
      if (!genai) {
         throw new Error('Google Generative AI client is not initialized. Please verify GEMINI_API_KEY in .env.')
      }

      // Filter Qdrant vector retrieval strictly by the authenticated userId
      const ret = vectorStore.asRetriever({
         k: 4,
         filter: {
            must: [
               {
                  key: 'metadata.userId',
                  match: { value: userId },
               },
            ],
         },
      })

      const resultDocs = await ret.invoke(prompt)

      // Collect unique reference PDFs from retrieved document metadata
      const referenceMap = new Map<string, ReferencePdf>()
      for (const doc of resultDocs) {
         const filename = doc.metadata?.filename
         const sourceName = doc.metadata?.source || doc.metadata?.filename || 'Document.pdf'
         if (filename && !referenceMap.has(filename)) {
            referenceMap.set(filename, {
               name: sourceName,
               url: `/uploads/pdf/${filename}`,
            })
         }
      }

      const references = Array.from(referenceMap.values())

      const contextText = resultDocs.map((doc) => doc.pageContent).join('\n\n')

      const SYSTEM_PROMPT =
         'Answer the user question accurately based on the provided document context. If the context does not contain enough information, state that clearly.'
      const fullPrompt = `${SYSTEM_PROMPT}\n\nDocuments Context:\n${contextText}\n\nUser Question: ${prompt}`

      const model = genai.getGenerativeModel({ model: 'gemini-3.6-flash' })
      const result = await model.generateContent(fullPrompt)
      const answer = result.response.text() ?? ''
      const id = crypto.randomUUID()

      console.log('PDF RAG Answer generated for user', userId)
      conversationRepository.setLastResponseId(convId, id)
      return { id, message: answer, references }
   },

   async pdfRagUpload(file: any, userId: string): Promise<boolean> {
      // 1. Store metadata in MongoDB
      const pdfDoc = await pdfRepository.savePdf({
         userId,
         originalName: file.originalname,
         filename: file.filename,
         path: file.path,
         mimeType: file.mimetype,
         size: file.size,
         status: 'Initializing...',
      })

      // 2. Enqueue background indexing job
      await queue.add('pdf-rag-upload-queue', {
         pdfId: pdfDoc._id,
         userId,
         name: file.originalname,
         filename: file.filename,
         path: file.path,
         destination: file.destination,
      })

      console.log('PDF record saved & added to BullMQ indexing queue for user:', userId)
      return true
   },

   async getUserPdfs(userId: string) {
      const pdfs = await pdfRepository.getUserPdfs(userId)
      return pdfs.map((pdf) => ({
         ...pdf,
         name: pdf.originalName,
         url: `/uploads/pdf/${pdf.filename}`,
      }))
   },
}
