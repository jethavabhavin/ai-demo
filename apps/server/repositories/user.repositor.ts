import { getDb } from '../lib/mongodb'
import type { User } from '../types/user.types'

export type { User }

const userRepository = {
   async getUserByEmail(email: string): Promise<User | null> {
      const db = await getDb()
      const user = await db.collection<User>('users').findOne({ email, status: true })
      return user
   },
}

export default userRepository
