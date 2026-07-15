import { getDb } from '../lib/mongodb'

const uploadRepository = {
   async saveImage(file: string): Promise<boolean> {
      const db = await getDb()

      const imageData = {
         image: file,
         createdAt: new Date(),
      }

      await db.collection('images').insertOne(imageData)
      return true
   },
}

export default uploadRepository
