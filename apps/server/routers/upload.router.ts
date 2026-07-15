import type { FastifyInstance } from 'fastify'
import { UploadController } from '../controllers/upload.controller'
import { uploadSchema } from '../schemas/upload.schema'

class UploadRouter {
   constructor(private fastify: FastifyInstance) {}

   public register(): void {
      this.fastify.post(
         '/api/upload',
         { preHandler: this.fastify.authenticate, schema: uploadSchema },
         UploadController.upload,
      )
   }
}

export default async function uploadRouter(fastify: FastifyInstance) {
   new UploadRouter(fastify).register()
}
