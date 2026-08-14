import { MongoClient, Db } from 'mongodb'

export class MongoDBDatabaseService {
   private static instance: MongoDBDatabaseService
   private client: MongoClient | null = null
   private db: Db | null = null

   private constructor() {}

   public static getInstance(): MongoDBDatabaseService {
      if (!MongoDBDatabaseService.instance) {
         MongoDBDatabaseService.instance = new MongoDBDatabaseService()
      }
      return MongoDBDatabaseService.instance
   }

   public async getDb(): Promise<Db | null> {
      const uri = process.env.MONGODB_URI
      const dbName = process.env.DB_NAME || 'clinic_db'

      if (!uri) {
         return null
      }

      if (!this.db) {
         try {
            this.client = new MongoClient(uri)
            await this.client.connect()
            this.db = this.client.db(dbName)
            console.log(`✅ MongoDB connected successfully to database: ${dbName}`)
         } catch (err) {
            console.warn('⚠️ MongoDB connection error:', err)
            return null
         }
      }

      return this.db
   }

   public async disconnect(): Promise<void> {
      if (this.client) {
         await this.client.close()
         this.client = null
         this.db = null
         console.log('🔌 MongoDB connection closed.')
      }
   }
}

export const mongoDBService = MongoDBDatabaseService.getInstance()
export const getDb = () => mongoDBService.getDb()
export default mongoDBService
