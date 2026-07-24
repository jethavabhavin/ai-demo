import type { ReferencePdf } from './pdf'

export interface Message {
   id: string
   role: 'user' | 'assistant'
   message: string
   references?: ReferencePdf[]
}
