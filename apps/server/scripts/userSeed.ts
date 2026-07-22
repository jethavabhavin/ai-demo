// scripts/seed.ts
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

dotenv.config()

const uri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME

async function seed() {
   if (!uri || !dbName) {
      throw new Error('MONGODB_URI or DB_NAME is not defined.')
   }
   const client = new MongoClient(uri)
   try {
      await client.connect()
      const db = client.db(dbName)
      const collection = db.collection('users')
      await db.collection('users').createIndex({ email: 1 })
      const count = await collection.countDocuments()
      if (count > 0) {
         console.log(`Users already exist. Skipping seed.`)
         return
      }
      await collection.deleteMany({})
      console.log('Cleared existing users')

      const rawUsers = [
         { name: 'Bhavin', status: true, email: 'bhavin@gmail.com', password: 'admin123' },
         { name: 'Muffin', status: false, email: 'muffin@gmail.com', password: 'admin123' },
         { name: 'Renish', status: true, email: 'renish@gmail.com', password: 'admin123' },
      ]

      const initialUsers = await Promise.all(
         rawUsers.map(async (user) => ({
            name: user.name,
            status: user.status,
            email: user.email,
            passwordHash: await bcrypt.hash(user.password, 10),
         })),
      )

      const result = await collection.insertMany(initialUsers)
      console.log(`Inserted ${result.insertedCount} users`)
   } catch (err) {
      console.error('Seed failed:', err)
   } finally {
      await client.close()
   }
}

seed()
