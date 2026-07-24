import type { FastifyInstance } from 'fastify'
import { ChatController } from '../controllers/chat.controller'
import { uploadPdfRagSchema, chatSchema, getUserPdfsSchema, deleteUserPdfSchema } from '../schemas/chat.schema'
import multer from 'fastify-multer'
import path from 'path'

// Define standard Multer storage
const storage = multer.diskStorage({
   destination: (req, file, cb) => cb(null, 'uploads/pdf'),
   filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + path.extname(file.originalname)
      cb(null, uniqueSuffix)
   },
})

const ALLOWED_MIME_TYPES = ['application/pdf']

// Initialize the multer instance with storage configurations
const upload = multer({
   storage: storage,
   limits: { fileSize: 100 * 1024 * 1024 }, // Limit file size to 100MB
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
         {
            preHandler: [this.fastify.authenticate, upload.single('pdf')],
            schema: { response: uploadPdfRagSchema.response },
         },
         ChatController.uploadPDFRag,
      )

      this.fastify.post(
         '/api/pdfchat',
         { preHandler: this.fastify.authenticate, schema: chatSchema },
         ChatController.sendPDfMessage,
      )

      this.fastify.get(
         '/api/user-pdfs',
         { preHandler: this.fastify.authenticate, schema: getUserPdfsSchema },
         ChatController.getUserPdfs,
      )

      this.fastify.delete(
         '/api/user-pdfs/:id',
         { preHandler: this.fastify.authenticate, schema: deleteUserPdfSchema },
         ChatController.deleteUserPdf,
      )
   }
}

export default async function chatRouter(fastify: FastifyInstance) {
   new ChatRouter(fastify).register()
}
