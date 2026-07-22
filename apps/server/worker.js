import { Worker } from 'bullmq'

const worker = new Worker(
   'pdf-rag-upload-queue',
   async (job) => {
      if (job.path) {
         console.log(job)
      }
   },
   {
      concurrency: 100,
      connection: {
         host: process.env.REDIS_HOST || 'localhost',
         port: Number(process.env.REDIS_PORT) || 6379,
      },
   },
)
