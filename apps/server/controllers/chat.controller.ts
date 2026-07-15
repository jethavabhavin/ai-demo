import type { FastifyRequest, FastifyReply } from 'fastify'
import { chatService } from './../services/chat.service'

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
}
