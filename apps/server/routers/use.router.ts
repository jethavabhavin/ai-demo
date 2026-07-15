import type { FastifyInstance } from 'fastify'
import { UserController } from '../controllers/user.controller'
import { userSchema } from '../schemas/user.schema'

class UserRouter {
   constructor(private fastify: FastifyInstance) {}

   public register(): void {
      this.fastify.post('/api/user/login', { schema: userSchema }, UserController.login)
   }
}

export default async function userRouter(fastify: FastifyInstance) {
   new UserRouter(fastify).register()
}
