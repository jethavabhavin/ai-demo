import { getDb } from '../lib/mongodb'
import type { User } from '../types/user.types'

export type { User }

export class UserRepository {
   async getUserByEmail(email: string): Promise<User | null> {
      const db = await getDb()
      const user = await db.collection<User>('users').findOne({ email, status: true })
      return user
   }
}

export const userRepository = new UserRepository()
export default userRepository
