// lib/mongodb.ts
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI as string)
let db: ReturnType<MongoClient['db']>

export async function getDb() {
   if (!db) {
      await client.connect()
      db = client.db('productCollection')
   }
   return db
}
