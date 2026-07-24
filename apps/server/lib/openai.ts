import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config()

const apiKey = process.env.OPENAI_API_KEY || process.env.ZENMUX_API_KEY
const baseURL = process.env.OPENAI_BASE_URL || (process.env.ZENMUX_API_KEY ? 'https://zenmux.ai/api/v1' : undefined)

let openai: OpenAI | null = null

if (apiKey) {
   openai = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
   })
}

export default openai
