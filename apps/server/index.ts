import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
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

/**
 * Swagger configuration
 */
// Register swagger (generates the OpenAPI spec)
await app.register(swagger, {
   openapi: {
      info: {
         title: 'My API',
         description: 'API documentation',
         version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:3001', description: 'Development server' }],
      tags: [{ name: 'user', description: 'User related endpoints' }],
   },
})

// Register swagger-ui (serves the interactive docs page)
await app.register(swaggerUi, {
   routePrefix: '/api/docs',
   uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
   },
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
