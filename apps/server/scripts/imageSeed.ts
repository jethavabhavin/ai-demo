// scripts/seed.ts
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config()

const uri = process.env.MONGODB_URI as string

async function seed() {
   const client = new MongoClient(uri)
   try {
      await client.connect()
      const dbName = process.env.DB_NAME
      if (!dbName) {
         throw new Error('DB_NAME is not defined.')
      }
      const db = client.db(dbName)
      await db.createCollection('images')
      console.log(`Initialize images collection.`)
   } catch (err) {
      console.error('Seed failed:', err)
   } finally {
      await client.close()
   }
}

seed()
