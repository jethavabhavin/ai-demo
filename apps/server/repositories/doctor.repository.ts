import { getDb } from '../lib/mongodb'
import type { Doctor } from '../types/doctor.types'

export class DoctorRepository {
   async findDoctorByQuery(query: string): Promise<Doctor | null> {
      try {
         const db = await getDb()
         if (!db) {
            return null
         }
         const collection = db.collection<Doctor>('doctors')
         const words = query
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 1)

         if (words.length === 0) {
            return null
         }

         const conditions = words.flatMap((word) => [
            { doctorName: { $regex: word, $options: 'i' } },
            { department: { $regex: word, $options: 'i' } },
            { specialty: { $regex: word, $options: 'i' } },
            { keywords: { $regex: word, $options: 'i' } },
         ])

         return await collection.findOne({ $or: conditions })
      } catch (err) {
         console.error('⚠️ Error searching doctor in DB:', err)
         return null
      }
   }
}

export const doctorRepository = new DoctorRepository()
export default doctorRepository
