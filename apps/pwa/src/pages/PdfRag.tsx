import { useState } from 'react'
import { env } from '@/config/env'
import { useAuth } from '@/context/AuthContext'
import { ChatContainer, type Message } from '@/components/ChatContainer'
import { PdfManager } from '@/components/PdfManager'

export default function PDFRag() {
   const { token } = useAuth()
   const [pdfs, setPdfs] = useState<File[] | null>(null)
   const [uploadStatus, setUploadStatus] = useState<Map<number, string>>(new Map())
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
         const res = await fetch('/api/pdfchat', {
            method: 'POST',
            headers: {
               Authorization: `Bearer ${token}`,
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
               message: data.message?.message ?? data.message ?? 'No response received.',
            },
         ])
      } catch {
         setMessages((prev) => [
            ...prev,
            {
               id: crypto.randomUUID(),
               role: 'assistant',
               message: 'Something went wrong while processing your request.',
            },
         ])
      } finally {
         setLoading(false)
      }
   }

   const updateUploadStatus = (status: string, index: number) => {
      setUploadStatus((prev) => {
         const next = new Map(prev)
         next.set(index, status)
         return next
      })
   }

   const uploadPDF = async (formData: FormData, index: number) => {
      try {
         const res = await fetch(`${env.apiUrl}/api/upload-pdf-rag`, {
            method: 'POST',
            body: formData,
            headers: {
               Authorization: `Bearer ${token}`,
            },
         })

         if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}))
            console.error('Upload failed:', res.status, errorBody)
            updateUploadStatus('Failed', index)
            return
         }

         updateUploadStatus('Success', index)
      } catch (err) {
         updateUploadStatus('Failed', index)
      }
   }

   const pdfUploadHandler = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.pdf'
      input.addEventListener('change', async (e: Event) => {
         const target = e.target as HTMLInputElement
         const file = target?.files?.[0]
         if (file) {
            const idx = pdfs?.length || 0
            setPdfs((prev) => (prev ? [...prev, file] : [file]))
            updateUploadStatus('Uploading...', idx)
            const formData = new FormData()
            formData.append('pdf', file)
            await uploadPDF(formData, idx)
         }
      })
      input.click()
   }
   return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8 flex flex-col items-center">
         <div className="w-full max-w-7xl flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
               <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                     📚 PDF Knowledge Base RAG
                  </h1>
                  <p className="text-sm text-muted-foreground">
                     Upload PDF documents to vector storage and query them using AI.
                  </p>
               </div>
            </div>

            {/* Content Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[78vh]">
               {/* Left Column: PDF Manager */}
               <PdfManager
                  className="lg:col-span-5"
                  pdfs={pdfs}
                  uploadStatus={uploadStatus}
                  onUploadPDF={pdfUploadHandler}
               />

               {/* Right Column: Chat Assistant */}
               <div className="lg:col-span-7 h-full">
                  <ChatContainer
                     title="🤖 PDF RAG Assistant"
                     className="h-full w-full shadow-sm border"
                     messages={messages}
                     loading={loading}
                     prompt={prompt}
                     onPromptChange={setPrompt}
                     onSendMessage={sendMessage}
                     placeholder="Ask questions about your uploaded PDFs..."
                  />
               </div>
            </div>
         </div>
      </div>
   )
}
