import { useRef, useState } from 'react'
import { DownloadCloud, FileText, Plus, SendHorizonal } from 'lucide-react'

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
   const fileInputRef = useRef<HTMLInputElement>(null)
   const [messages, setMessages] = useState<Message[]>([])
   const [inputOpen, setInputOpen] = useState<boolean>(false)
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
   const openInputContextHandler = () => {
      setInputOpen((state) => !state)
   }
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
      }
   }
   const documentHandler = () => {
      if (fileInputRef.current) {
         fileInputRef.current.click()
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
                  <div className="relative h-full w-12 ">
                     {inputOpen && (
                        <div className="flex gap-2 absolute bottom-10 bg-gray-100 border-2 p-2 rounded">
                           <Button className="relative" variant="outline" size="icon-lg" onClick={documentHandler}>
                              <input
                                 type="file"
                                 className="hidden"
                                 accept=".pdf"
                                 onChange={handleFileChange}
                                 ref={fileInputRef}
                              />
                              <FileText className="h-6 w-6" />
                           </Button>
                        </div>
                     )}
                     <Button variant="outline" className="rounded-xl" size="icon-lg" onClick={openInputContextHandler}>
                        <Plus className="h-6 w-6" />
                     </Button>
                  </div>
                  <Textarea
                     value={prompt}
                     placeholder="Message AI..."
                     className="min-h-18 resize-none"
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
