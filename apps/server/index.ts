import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import chatRouter from './routers/chat.router'
import productRouter from './routers/product.router'
import uploadRouter from './routers/upload.router'

dotenv.config()

const app = Fastify({
   logger: true,
   bodyLimit: 10 * 1024 * 1024, // 10mb limit
})

// Register CORS
await app.register(cors, {
   origin: true,
   credentials: false,
})

// Register routers
await app.register(chatRouter)
await app.register(productRouter)
await app.register(uploadRouter)

const port = Number(process.env.PORT) || 3000

try {
   await app.listen({ port, host: '0.0.0.0' })
   console.log(`Server is running on port ${port}`)
} catch (err) {
   app.log.error(err)
   process.exit(1)
}
