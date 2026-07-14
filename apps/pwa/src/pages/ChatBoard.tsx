import { useState } from 'react'
import { SendHorizonal } from 'lucide-react'

import { ChatMessage } from '@/components/ui/chat-message'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Message {
   id: string
   role: 'user' | 'assistant'
   message: string
}

export default function ChatBoard() {
   const [messages, setMessages] = useState<Message[]>([])
   const [prompt, setPrompt] = useState('')
   const [loading, setLoading] = useState(false)

   const [convId] = useState(() => crypto.randomUUID())

   const sendMessage = async () => {
      if (!prompt.trim() || loading) return

      const userMessage: Message = {
         id: crypto.randomUUID(),
         role: 'user',
         message: prompt,
      }

      setMessages((prev) => [...prev, userMessage])
      setPrompt('')
      setLoading(true)

      try {
         const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               convId,
               prompt: userMessage.message,
            }),
         })

         const data = await res.json()

         setMessages((prev) => [
            ...prev,
            {
               id: data.message.id,
               role: 'assistant',
               message: data.message.message,
            },
         ])
      } catch {
         setMessages((prev) => [
            ...prev,
            {
               id: crypto.randomUUID(),
               role: 'assistant',
               message: 'Something went wrong.',
            },
         ])
      } finally {
         setLoading(false)
      }
   }

   return (
      <main className="flex h-screen items-center justify-center bg-muted/40 p-6">
         <Card className="flex h-[90vh] w-full max-w-5xl flex-col">
            <CardHeader className="border-b">
               <CardTitle>🤖 AI Assistant</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
               <ScrollArea className="h-full px-6 py-4">
                  <div className="space-y-4">
                     {messages.length === 0 && (
                        <div className="flex h-[60vh] items-center justify-center text-center text-muted-foreground">
                           <div>
                              <h2 className="text-2xl font-semibold">Welcome 👋</h2>
                              <p>Ask me anything to get started.</p>
                           </div>
                        </div>
                     )}

                     {messages.map((msg) => (
                        <ChatMessage key={msg.id} role={msg.role} message={msg.message} />
                     ))}

                     {loading && <ChatMessage role="assistant" message="Thinking..." />}
                  </div>
               </ScrollArea>
            </CardContent>

            <CardFooter className="border-t">
               <div className="flex w-full gap-3">
                  <Textarea
                     value={prompt}
                     placeholder="Message AI..."
                     className="min-h-[60px] resize-none"
                     onChange={(e) => setPrompt(e.target.value)}
                     onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault()
                           sendMessage()
                        }
                     }}
                  />

                  <Button size="icon" disabled={loading} onClick={sendMessage}>
                     <SendHorizonal className="h-5 w-5" />
                  </Button>
               </div>
            </CardFooter>
         </Card>
      </main>
   )
}
