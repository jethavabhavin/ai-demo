import type { FastifyInstance } from 'fastify'
import { ProductController } from '../controllers/product.controller'
import { productSchema, deleteProductSchema } from '../schemas/product.schema'

class ProductRouter {
   constructor(private fastify: FastifyInstance) {}

   public register(): void {
      this.fastify.get(
         '/api/products',
         { preHandler: this.fastify.authenticate, schema: productSchema },
         ProductController.getProducts,
      )

      this.fastify.delete(
         '/api/products/:id',
         { preHandler: this.fastify.authenticate, schema: deleteProductSchema },
         ProductController.deleteProduct,
      )
   }
}

export default async function productRouter(fastify: FastifyInstance) {
   new ProductRouter(fastify).register()
}
