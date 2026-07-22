import type { FastifyInstance } from 'fastify'
import { ChatController } from '../controllers/chat.controller'
import { uploadPdfRagSchema, chatSchema } from '../schemas/chat.schema'
import multer from 'fastify-multer'
import path from 'path'

// 2. Define standard Multer storage
const storage = multer.diskStorage({
   destination: (req, file, cb) => cb(null, 'uploads/pdf'),
   filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + path.extname(file.originalname)
      cb(null, uniqueSuffix)
   },
})

const ALLOWED_MIME_TYPES = ['application/pdf']

// 2. Initialize the multer instance with storage configurations
const upload = multer({
   storage: storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit file size to 5MB
   fileFilter: (req, file, cb) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
         return cb(new Error('Only PDF files are allowed'))
      }
      cb(null, true)
   },
})

class ChatRouter {
   constructor(private fastify: FastifyInstance) {}

   public register(): void {
      this.fastify.post(
         '/api/chat',
         { preHandler: this.fastify.authenticate, schema: chatSchema },
         ChatController.sendMessage,
      )
      this.fastify.post(
         '/api/upload-pdf-rag',
         { preHandler: upload.single('pdf'), schema: { response: uploadPdfRagSchema.response } },
         ChatController.uploadPDFRag,
      )
   }
}

export default async function chatRouter(fastify: FastifyInstance) {
   new ChatRouter(fastify).register()
}
