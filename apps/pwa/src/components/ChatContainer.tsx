import { useRef, useState } from 'react'
import { FileText, Plus, SendHorizonal } from 'lucide-react'

import { ChatMessage } from '@/components/ui/chat-message'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export interface Message {
   id: string
   role: 'user' | 'assistant'
   message: string
}

interface ChatContainerProps {
   title?: string
   messages: Message[]
   loading?: boolean
   prompt: string
   onPromptChange: (value: string) => void
   onSendMessage: () => void
   onFileSelect?: (file: File) => void
   acceptedFileTypes?: string
   placeholder?: string
   className?: string
}

export function ChatContainer({
   title = '🤖 AI Assistant',
   messages,
   loading = false,
   prompt,
   onPromptChange,
   onSendMessage,
   onFileSelect,
   acceptedFileTypes = '.pdf',
   placeholder = 'Message AI...',
   className,
}: ChatContainerProps) {
   const fileInputRef = useRef<HTMLInputElement>(null)
   const [inputOpen, setInputOpen] = useState(false)

   const openInputContextHandler = () => {
      setInputOpen((state) => !state)
   }

   const documentHandler = () => {
      fileInputRef.current?.click()
   }

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && onFileSelect) {
         onFileSelect(file)
         setInputOpen(false)
      }
   }

   const containerStyle = className ?? 'h-[90vh] w-full max-w-5xl'

   return (
      <Card className={`flex flex-col ${containerStyle}`}>
         <CardHeader className="border-b py-3 px-6">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
         </CardHeader>

         <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6 py-4">
               <div className="space-y-4 min-h-full flex flex-col justify-end">
                  {messages.length === 0 && (
                     <div className="my-auto flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Welcome 👋</h2>
                        <p className="mt-1 text-sm text-gray-500">Ask me anything to get started.</p>
                     </div>
                  )}

                  {messages.map((msg) => (
                     <ChatMessage key={msg.id} role={msg.role} message={msg.message} />
                  ))}

                  {loading && <ChatMessage role="assistant" message="Thinking..." />}
               </div>
            </ScrollArea>
         </CardContent>

         <CardFooter className="border-t p-4">
            <div className="flex w-full items-center gap-3">
               {onFileSelect && (
                  <div className="relative">
                     {inputOpen && (
                        <div className="absolute bottom-12 left-0 z-10 flex gap-2 rounded-lg border bg-popover p-2 shadow-md">
                           <Button className="relative" variant="outline" size="icon" onClick={documentHandler}>
                              <input
                                 type="file"
                                 className="hidden"
                                 accept={acceptedFileTypes}
                                 onChange={handleFileChange}
                                 ref={fileInputRef}
                              />
                              <FileText className="h-5 w-5" />
                           </Button>
                        </div>
                     )}
                     <Button variant="outline" size="icon" onClick={openInputContextHandler}>
                        <Plus className="h-5 w-5" />
                     </Button>
                  </div>
               )}
               <Textarea
                  value={prompt}
                  placeholder={placeholder}
                  className="min-h-[44px] max-h-[120px] resize-none flex-1 py-2.5"
                  onChange={(e) => onPromptChange(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        onSendMessage()
                     }
                  }}
               />
               <Button size="icon" disabled={loading || !prompt.trim()} onClick={onSendMessage}>
                  <SendHorizonal className="h-5 w-5" />
               </Button>
            </div>
         </CardFooter>
      </Card>
   )
}
