import OpenAI from 'openai'
import { conversationRepository } from '../repositories/conversition.repositor'

// const openai = new OpenAI({
//    apiKey: process.env.OPENAI_API_KEY,
// })
// 1. Configure the disk storage engine

const openai = new OpenAI({
   baseURL: 'https://zenmux.ai/api/v1',
   apiKey: process.env.ZENMUX_API_KEY,
})

type ChatResponse = {
   id: string
   message: string
}

export const chatService = {
   async sendMessage(prompt: string, convId: string): Promise<ChatResponse> {
      // const response = await openai.responses.create({
      //    model: 'openai/gpt-4o-mini',
      //    input: prompt,
      //    temperature: 0.2,
      //    max_output_tokens: 50,
      //    previous_response_id: conversationRepository.getLastResponseId(convId),
      // })
      const response = await openai.chat.completions.create({
         model: 'openai/gpt-4o-mini',
         messages: [
            {
               role: 'user',
               content: 'What is the meaning of life?',
            },
         ],
      })
      console.log(response.choices[0]?.message.content)
      conversationRepository.setLastResponseId(convId, response.id)
      return { id: response.id, message: 'response.choices[0]?.message.content' }
   },
}
