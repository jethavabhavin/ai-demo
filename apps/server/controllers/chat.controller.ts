import type { Request, Response } from 'express'
import z from 'zod'
import { chatService } from './../services/chat.service'

const chatValiSchema = z.object({
   prompt: z.string().trim().min(1, 'Prompt is required.').max(1000, 'Max 1000 character allow.'),
   convId: z.uuid(),
})

export const ChatController = {
   async sendMessage(req: Request, res: Response) {
      const { convId, prompt } = req.body
      const validResult = chatValiSchema.safeParse(req.body)
      if (validResult.error) {
         res.status(400).json(z.flattenError(validResult.error))
         return
      }
      try {
         const message = await chatService.sendMessage(prompt, convId)
         res.json({ message })
      } catch (e) {
         res.status(500).json({ error: 'Failed to generate response.' })
      }
   },
}
