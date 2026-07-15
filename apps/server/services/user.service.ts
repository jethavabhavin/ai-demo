import jwt from 'jsonwebtoken'
import userRepository from '../repositories/user.repositor'
import bcrypt from 'bcrypt'

type LoginResponse = {
   id: string
   token: string
   message: string
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string

export const userService = {
   async login(email: string, password: string): Promise<LoginResponse> {
      const user = await userRepository.getUserByEmail(email)
      if (!user) {
         throw new Error('User not found')
      }

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
         throw new Error('Invalid password')
      }

      const token = jwt.sign({ id: user._id, email: user.email }, ACCESS_SECRET, { expiresIn: '1h' })

      return { id: user._id, token: token, message: 'Login successful' }
   },
}
