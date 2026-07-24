import type { FastifyRequest, FastifyReply } from 'fastify'
import { chatService } from './../services/chat.service'

function getUserId(req: any): string {
   const user = req.user
   if (!user) return ''
   return user.id || user._id || user.sub || ''
}

export const ChatController = {
   async sendMessage(req: FastifyRequest, reply: FastifyReply) {
      const { convId, prompt } = req.body as { convId: string; prompt: string }
      try {
         const message = await chatService.sendMessage(prompt, convId)
         reply.send({ message })
      } catch (e) {
         reply.status(500).send({ error: 'Failed to generate response.' })
      }
   },

   async sendPDfMessage(req: FastifyRequest, reply: FastifyReply) {
      const { convId, prompt } = req.body as { convId: string; prompt: string }
      const userId = getUserId(req)
      try {
         const message = await chatService.sendPDfRagMessage(prompt, convId, userId)
         reply.send({ message })
      } catch (e) {
         console.error('PDF Chat Error:', e)
         reply.status(500).send({ error: 'Failed to generate response.' })
      }
   },

   async uploadPDFRag(req: any, reply: FastifyReply) {
      const file = req.file
      const userId = getUserId(req)
      if (!file) {
         return reply.status(400).send('No file uploaded.')
      }
      await chatService.pdfRagUpload(file, userId)
      reply.send({ status: 'File uploaded successfully', file: file })
   },

   async getUserPdfs(req: FastifyRequest, reply: FastifyReply) {
      const userId = getUserId(req)
      try {
         const pdfs = await chatService.getUserPdfs(userId)
         reply.send({ pdfs })
      } catch (e) {
         console.error('Failed to get user PDFs:', e)
         reply.status(500).send({ error: 'Failed to fetch user PDFs.' })
      }
   },

   async deleteUserPdf(req: FastifyRequest, reply: FastifyReply) {
      const { id } = req.params as { id: string }
      const userId = getUserId(req)
      try {
         await chatService.deleteUserPdf(id, userId)
         reply.send({ message: 'PDF document deleted successfully', success: true })
      } catch (e: any) {
         console.error('Failed to delete PDF:', e)
         reply.status(404).send({ error: e.message || 'Failed to delete PDF document.' })
      }
   },
}
