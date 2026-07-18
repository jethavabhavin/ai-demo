import type { FastifyRequest, FastifyReply } from 'fastify'
import { productService } from '../services/product.service'

export const ProductController = {
   async getProducts(req: FastifyRequest, reply: FastifyReply) {
      try {
         const { search, limit, page } = req.query as { search: string; limit: number; page: number }
         console.log(search, limit, page)
         const { data, pagination } = await productService.getProducts(search, limit, page)
         reply.send({ data, pagination })
      } catch (e) {
         reply.status(500).send({ error: 'Failed to generate response.' })
      }
   },
}
