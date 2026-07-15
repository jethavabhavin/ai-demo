import type { FastifyRequest, FastifyReply } from 'fastify'
import { userService } from '../services/user.service'

export const UserController = {
   async login(req: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) {
      const { email, password } = req.body
      try {
         const result = await userService.login(email, password)

         reply.send({ ...result })
      } catch (e) {
         reply.status(500).send({ error: 'Failed to generate response.' })
      }
   },
}
