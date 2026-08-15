import { getDb } from '../lib/mongodb'

export class UploadRepository {
   async saveImage(file: string): Promise<boolean> {
      const db = await getDb()

      const imageData = {
         image: file,
         createdAt: new Date(),
      }

      await db.collection('images').insertOne(imageData)
      return true
   }
}

export const uploadRepository = new UploadRepository()
export default uploadRepository
