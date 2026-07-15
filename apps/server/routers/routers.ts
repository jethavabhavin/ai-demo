import express from 'express'
import type { Request, Response } from 'express'
import { ChatController } from '../controllers/chat.controller'
import { ProductController } from '../controllers/product.controller'
import { UploadController } from '../controllers/upload.controller'

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
   res.send('Hello World')
})

router.get('/api/hello', (req: Request, res: Response) => {
   res.send('Hello World')
})

router.post('/api/chat', ChatController.sendMessage)

router.get('/api/products', ProductController.getProducts)

router.post('/api/upload', UploadController.upload)

export default router
