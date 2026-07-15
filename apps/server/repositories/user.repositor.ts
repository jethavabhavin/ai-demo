import { getDb } from '../lib/mongodb'

export interface User {
   _id: string
   email: string
   name: string
   passwordHash: string
   status: boolean
}

const userRepository = {
   async getUserByEmail(email: string): Promise<User | null> {
      const db = await getDb()
      const user = await db.collection<User>('users').findOne({ email, status: true })
      return user
   },
}

export default userRepository
