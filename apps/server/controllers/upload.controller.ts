import type { FastifyRequest, FastifyReply } from 'fastify'
import { uploadService } from '../services/upload.service'

export class UploadControllerClass {
   async upload(req: FastifyRequest, reply: FastifyReply) {
      try {
         const { image } = req.body as { image: string }
         const stats = await uploadService.upload(image)
         reply.send({ stats })
      } catch (e) {
         console.error('Upload failed:', e)
         reply.status(400).send({ error: e instanceof Error ? e.message : 'Failed to upload image.' })
      }
   }
}

export const UploadController = new UploadControllerClass()
export default UploadController
