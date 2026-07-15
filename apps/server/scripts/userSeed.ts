// scripts/seed.ts
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

dotenv.config()

const uri = process.env.MONGODB_URI as string
const dbName = process.env.DB_NAME as string

async function seed() {
   const client = new MongoClient(uri)
   try {
      await client.connect()
      const db = client.db(dbName)
      const collection = db.collection('users')

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
