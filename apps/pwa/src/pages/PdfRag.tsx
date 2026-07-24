import { useState } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, FileCode } from 'lucide-react'
import { env } from '@/config/env'
import { useAuth } from '@/context/AuthContext'
import { ChatContainer, type Message } from '@/components/ChatContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

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
               <Card className="lg:col-span-5 flex flex-col h-full overflow-hidden shadow-sm border">
                  <CardHeader className="border-b py-3 px-6">
                     <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                           <FileText className="h-5 w-5 text-primary" />
                           Uploaded PDFs
                        </CardTitle>
                        {pdfs && pdfs.length > 0 && (
                           <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                              {pdfs.length} {pdfs.length === 1 ? 'file' : 'files'}
                           </span>
                        )}
                     </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
                     {/* Upload Action Zone */}
                     <div
                        onClick={pdfUploadHandler}
                        className="group flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 bg-muted/20 hover:bg-primary/5 rounded-xl p-6 transition-all duration-200 cursor-pointer text-center"
                     >
                        <div className="p-3 bg-background rounded-full border shadow-sm group-hover:scale-105 transition-transform">
                           <UploadCloud className="h-6 w-6 text-primary" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">Click to upload PDF</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Supports PDF documents up to 100MB</p>
                     </div>

                     {/* PDF Documents List */}
                     <div className="flex-1 overflow-hidden flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                           Indexed Documents
                        </span>

                        <ScrollArea className="flex-1 pr-3">
                           {!pdfs || pdfs.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                                 <FileCode className="h-10 w-10 text-muted-foreground/40 mb-2" />
                                 <p className="text-sm">No PDF documents uploaded yet.</p>
                              </div>
                           ) : (
                              <div className="space-y-2">
                                 {pdfs.map((pdf, idx) => {
                                    const status = uploadStatus.get(idx) ?? 'Pending'
                                    return (
                                       <div
                                          key={idx}
                                          className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-accent/40 transition-colors"
                                       >
                                          <div className="flex items-center gap-3 overflow-hidden">
                                             <FileText className="h-5 w-5 text-red-500 shrink-0" />
                                             <div className="truncate">
                                                <p className="text-sm font-medium truncate">{pdf.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                   {(pdf.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                             </div>
                                          </div>

                                          <div className="shrink-0 ml-2">
                                             {status === 'Uploading...' && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200">
                                                   <Loader2 className="h-3 w-3 animate-spin" />
                                                   Uploading
                                                </span>
                                             )}
                                             {status === 'Success' && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200">
                                                   <CheckCircle2 className="h-3 w-3" />
                                                   Indexed
                                                </span>
                                             )}
                                             {status === 'Failed' && (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-full border border-red-200">
                                                   <AlertCircle className="h-3 w-3" />
                                                   Failed
                                                </span>
                                             )}
                                          </div>
                                       </div>
                                    )
                                 })}
                              </div>
                           )}
                        </ScrollArea>
                     </div>
                  </CardContent>
               </Card>

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
