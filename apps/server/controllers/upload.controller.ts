import type { FastifyRequest, FastifyReply } from 'fastify'
import { uploadService } from '../services/upload.service'

export const UploadController = {
   async upload(req: FastifyRequest<{ Body: { image: string } }>, reply: FastifyReply) {
      try {
         console.log(req.body)
         const stats = await uploadService.upload(req.body.image)
         reply.send({ stats })
      } catch (e) {
         console.error('Upload failed:', e)
         reply.status(400).send({ error: e instanceof Error ? e.message : 'Failed to upload image.' })
      }
   },
}
