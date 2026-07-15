import type { FastifyInstance } from 'fastify'
import { ChatController } from '../controllers/chat.controller'
import { chatSchema } from '../schemas/chat.schema'

class ChatRouter {
   constructor(private fastify: FastifyInstance) {}

   public register(): void {
      this.fastify.post('/api/chat', { schema: chatSchema }, ChatController.sendMessage)
   }
}

export default async function chatRouter(fastify: FastifyInstance) {
   new ChatRouter(fastify).register()
}
