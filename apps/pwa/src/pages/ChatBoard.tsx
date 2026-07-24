import { useState } from 'react'

import { ChatContainer, type Message } from '@/components/ChatContainer'

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

   const handleFileSelect = (file: File) => {
      console.log('File selected:', file.name)
   }

   return (
      <main className="flex h-screen items-center justify-center bg-muted/40 p-6">
         <ChatContainer
            messages={messages}
            loading={loading}
            prompt={prompt}
            onPromptChange={setPrompt}
            onSendMessage={sendMessage}
            onFileSelect={handleFileSelect}
         />
      </main>
   )
}
