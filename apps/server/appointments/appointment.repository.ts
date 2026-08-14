import { getDb } from '../lib/mongodb'

export interface AppointmentRecord {
   id: string
   patientName: string
   phone: string
   email: string
   doctorName: string
   specialty: string
   department: string
   date: string // YYYY-MM-DD
   time: string // e.g. "11:00 AM"
   googleCalendarEventId?: string
   status: 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED'
   createdAt: string
   updatedAt: string
}

const COLLECTION_NAME = 'ClinicAppointment'

class AppointmentRepository {
   private inMemoryStore: Map<string, AppointmentRecord> = new Map()

   constructor() {
      this.ensureIndexes()
   }

   private async ensureIndexes() {
      try {
         const db = await getDb()
         if (db) {
            const collection = db.collection(COLLECTION_NAME)
            await collection.createIndex({ id: 1 }, { unique: true })
            await collection.createIndex({ phone: 1 })
            console.log(`✅ MongoDB collection '${COLLECTION_NAME}' indexed successfully.`)
         }
      } catch (err) {
         console.warn(`Notice on MongoDB '${COLLECTION_NAME}' index creation:`, err)
      }
   }

   async create(appointment: Omit<AppointmentRecord, 'createdAt' | 'updatedAt'>): Promise<AppointmentRecord> {
      const now = new Date().toISOString()
      const record: AppointmentRecord = {
         ...appointment,
         createdAt: now,
         updatedAt: now,
      }

      try {
         const db = await getDb()
         if (db) {
            await db.collection<AppointmentRecord>(COLLECTION_NAME).insertOne({ ...record })
            console.log(`✅ Created appointment ${record.id} in MongoDB collection '${COLLECTION_NAME}'`)
         }
      } catch (err) {
         console.error(`Error saving appointment to MongoDB collection '${COLLECTION_NAME}':`, err)
      }

      this.inMemoryStore.set(record.id, record)
      this.inMemoryStore.set(record.phone, record)
      return record
   }

   async findByIdOrPhone(identifier: string): Promise<AppointmentRecord | null> {
      const clean = identifier.trim()

      try {
         const db = await getDb()
         if (db) {
            const doc = await db.collection<AppointmentRecord>(COLLECTION_NAME).findOne({
               $or: [
                  { id: clean },
                  { id: clean.toUpperCase() },
                  { phone: clean },
                  { phone: clean.replace(/\s+/g, '') },
               ],
               status: { $ne: 'CANCELLED' },
            })
            if (doc) {
               return doc as AppointmentRecord
            }
         }
      } catch (err) {
         console.error(`MongoDB query error in collection '${COLLECTION_NAME}':`, err)
      }

      const match = this.inMemoryStore.get(clean)
      if (match && match.status !== 'CANCELLED') return match

      for (const rec of this.inMemoryStore.values()) {
         if (
            (rec.id.toLowerCase() === clean.toLowerCase() ||
               rec.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, '')) &&
            rec.status !== 'CANCELLED'
         ) {
            return rec
         }
      }

      return null
   }

   async update(id: string, updates: Partial<AppointmentRecord>): Promise<AppointmentRecord | null> {
      const existing = await this.findByIdOrPhone(id)
      if (!existing) return null

      const updated: AppointmentRecord = {
         ...existing,
         ...updates,
         updatedAt: new Date().toISOString(),
      }

      try {
         const db = await getDb()
         if (db) {
            await db.collection<AppointmentRecord>(COLLECTION_NAME).updateOne(
               { id: existing.id },
               {
                  $set: {
                     ...updates,
                     updatedAt: new Date().toISOString(),
                  },
               },
            )
            console.log(`✅ Updated appointment ${existing.id} in MongoDB collection '${COLLECTION_NAME}'`)
         }
      } catch (err) {
         console.error(`MongoDB update error in collection '${COLLECTION_NAME}':`, err)
      }

      this.inMemoryStore.set(existing.id, updated)
      this.inMemoryStore.set(existing.phone, updated)
      return updated
   }
}

export const appointmentRepository = new AppointmentRepository()
export default appointmentRepository
