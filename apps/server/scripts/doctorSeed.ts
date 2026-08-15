import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config()

const uri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME || 'productCollection'

async function seed() {
   if (!uri) {
      console.warn('⚠️ MONGODB_URI is not defined in environment variables. Skipping doctor seed.')
      return
   }
   const client = new MongoClient(uri)
   try {
      await client.connect()
      const db = client.db(dbName)
      const collection = db.collection('doctors')
      await collection.createIndex({ doctorName: 1 }, { unique: true })

      const doctors = [
         {
            doctorName: 'Dr. Patel',
            department: 'Cardiology',
            specialty: 'Cardiology',
            keywords: ['patel', 'cardiology', 'heart'],
         },
         {
            doctorName: 'Dr. Sarah Jenkins',
            department: 'Pediatrics',
            specialty: 'Pediatrics',
            keywords: ['jenkins', 'pediatric', 'pediatrics', 'child', 'kids'],
         },
         {
            doctorName: 'Dr. Michael Chen',
            department: 'Neurology',
            specialty: 'Neurology',
            keywords: ['chen', 'neurolog', 'neurology', 'brain'],
         },
         {
            doctorName: 'Dr. Emily Davis',
            department: 'Dermatology',
            specialty: 'Dermatology',
            keywords: ['davis', 'dermatolog', 'dermatology', 'skin'],
         },
         {
            doctorName: 'Dr. Robert Taylor',
            department: 'Orthopedics',
            specialty: 'Orthopedics',
            keywords: ['taylor', 'orthoped', 'orthopedics', 'bone', 'joint'],
         },
      ]

      for (const doc of doctors) {
         await collection.updateOne({ doctorName: doc.doctorName }, { $set: doc }, { upsert: true })
      }

      console.log(`✅ Successfully seeded ${doctors.length} doctors into database '${dbName}'.`)
   } catch (err) {
      console.error('❌ doctorSeed failed:', err)
   } finally {
      await client.close()
   }
}

seed()
