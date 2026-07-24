import { conversationRepository } from '../repositories/conversition.repositor'
import { Queue } from 'bullmq'
import { getVectorStore } from '../lib/vectorStore'
import genai from '../lib/genai'

const vectorStore = await getVectorStore()

const queue = new Queue('pdf-rag-upload-queue', {
   connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
   },
})

type ChatResponse = {
   id: string
   message: string
}

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

   async sendPDfRagMessage(prompt: string, convId: string): Promise<ChatResponse> {
      if (!genai) {
         throw new Error('Google Generative AI client is not initialized. Please verify GEMINI_API_KEY in .env.')
      }

      const ret = vectorStore.asRetriever({
         k: 2,
      })
      const resultDocs = await ret.invoke(prompt)
      const contextText = resultDocs.map((doc) => doc.pageContent).join('\n\n')

      const SYSTEM_PROMPT = 'Answer the question based on the context provided.'
      const fullPrompt = `${SYSTEM_PROMPT}\n\nDocuments Context:\n${contextText}\n\nUser Question: ${prompt}`

      const model = genai.getGenerativeModel({ model: 'gemini-3.6-flash' })
      const result = await model.generateContent(fullPrompt)
      const answer = result.response.text() ?? ''
      const id = crypto.randomUUID()

      console.log('answer', answer)
      conversationRepository.setLastResponseId(convId, id)
      return { id, message: answer }
   },

   async pdfRagUpload(file: any): Promise<boolean> {
      await queue.add('pdf-rag-upload-queue', {
         name: file.originalname,
         path: file.path,
         destination: file.destination,
      })
      console.log('Added to queue')
      return false
   },
}
