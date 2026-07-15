import type { FastifyRequest, FastifyReply } from 'fastify'
import { productService } from '../services/product.service'

export const ProductController = {
   async getProducts(req: FastifyRequest, reply: FastifyReply) {
      try {
         const product = await productService.getProducts()
         reply.send({ data: product })
      } catch (e) {
         reply.status(500).send({ error: 'Failed to generate response.' })
      }
   },
}
