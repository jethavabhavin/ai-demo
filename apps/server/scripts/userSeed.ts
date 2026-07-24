import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
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
      const collection = db.collection('users')
      await collection.createIndex({ email: 1 })

      const rawUsers = [
         { name: 'Bhavin', status: true, email: 'bhavin@gmail.com', password: 'admin123' },
         { name: 'Muffin', status: false, email: 'muffin@gmail.com', password: 'admin123' },
         { name: 'Renish', status: true, email: 'renish@gmail.com', password: 'admin123' },
      ]

      for (const user of rawUsers) {
         const passwordHash = await bcrypt.hash(user.password, 10)
         await collection.updateOne(
            { email: user.email },
            {
               $set: {
                  name: user.name,
                  status: user.status,
                  email: user.email,
                  passwordHash,
               },
            },
            { upsert: true },
         )
      }

      console.log(`Successfully seeded ${rawUsers.length} initial users.`)
   } catch (err) {
      console.error('userSeed failed:', err)
   } finally {
      await client.close()
   }
}

seed()
