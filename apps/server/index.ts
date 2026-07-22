import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import chatRouter from './routers/chat.router'
import productRouter from './routers/product.router'
import uploadRouter from './routers/upload.router'
import userRouter from './routers/use.router'
import fastifyJwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import fastifyExpress from '@fastify/express'
import path from 'path'
import fs from 'fs'

dotenv.config()

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) {
   fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const app = Fastify({
   logger: true,
   bodyLimit: 10 * 1024 * 1024, // 10mb limit
})

// 1. Register the Express compatibility plugin
await app.register(fastifyExpress)

// Register multipart to handle file uploads
await app.register(multipart)

await app.register(cors, {
   origin: true,
   credentials: true,
   // Allow Authorization header for JWT auth
   allowedHeaders: ['Authorization', 'Content-Type'],
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})

/**
 * JWT autharazation
 */
app.register(fastifyJwt, {
   secret: process.env.JWT_ACCESS_SECRET || '',
})

/**
 * Decorator to protect routes — verifies the JWT
 */
app.decorate('authenticate', async function (request: any, reply: any) {
   try {
      await request.jwtVerify()
   } catch (err) {
      reply.code(401).send({ message: 'Unauthorized' })
   }
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
      components: {
         securitySchemes: {
            bearerAuth: {
               type: 'http',
               scheme: 'bearer',
               bearerFormat: 'JWT',
            },
         },
      },
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
await app.register(userRouter)

const port = Number(process.env.PORT) || 3002

try {
   await app.listen({ port, host: '0.0.0.0' })
   console.log(`Server is running on port ${port}`)
} catch (err) {
   app.log.error(err)
   process.exit(1)
}
