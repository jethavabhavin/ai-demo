import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config()

const uri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME

async function seed() {
   if (!uri || !dbName) {
      throw new Error('MONGODB_URI or DB_NAME is not defined in environment variables.')
   }
   const client = new MongoClient(uri)
   try {
      await client.connect()
      const db = client.db(dbName)

      const collections = await db.listCollections({ name: 'pdf_documents' }).toArray()
      if (collections.length === 0) {
         await db.createCollection('pdf_documents')
         console.log('Created pdf_documents collection.')
      }

      await db.collection('pdf_documents').createIndex({ userId: 1 })
      await db.collection('pdf_documents').createIndex({ createdAt: -1 })
      console.log('Initialized pdf_documents collection and indexes successfully.')
   } catch (err) {
      console.error('pdfSeed failed:', err)
   } finally {
      await client.close()
   }
}

seed()
