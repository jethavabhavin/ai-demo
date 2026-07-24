import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config()

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

let genai: GoogleGenerativeAI | null = null

if (apiKey) {
   genai = new GoogleGenerativeAI(apiKey)
}

export default genai
