// scripts/seed.ts
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI as string

async function seed() {
   const client = new MongoClient(uri)
   try {
      await client.connect()
      const db = client.db('productCollection')
      const collection = db.collection('images')

      console.log(`Initialize images collection.`)
   } catch (err) {
      console.error('Seed failed:', err)
   } finally {
      await client.close()
   }
}

seed()
