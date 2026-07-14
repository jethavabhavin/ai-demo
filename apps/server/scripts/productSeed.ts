// scripts/seed.ts
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI as string

const initialProducts = [
   { name: 'T-Shirt', status: true, price: 100 },
   { name: 'Mobile', status: true, price: 2500 },
   { name: 'Laptop', status: false, price: 4500 },
]

async function seed() {
   const client = new MongoClient(uri)
   try {
      await client.connect()
      const db = client.db('productCollection')
      const collection = db.collection('products')

      await collection.deleteMany({})
      console.log('Cleared existing products')

      const result = await collection.insertMany(initialProducts)
      console.log(`Inserted ${result.insertedCount} products`)
   } catch (err) {
      console.error('Seed failed:', err)
   } finally {
      await client.close()
   }
}

seed()
