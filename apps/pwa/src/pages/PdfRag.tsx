import { ChatContainer } from '@/components/ChatContainer'
import { PdfManager } from '@/components/PdfManager'
import { usePdfRag } from '@/hooks/pdfs'

export default function PDFRag() {
   const { pdfs, uploadStatus, messages, prompt, setPrompt, isChatLoading, sendMessage, triggerFilePicker } =
      usePdfRag()

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
                  onUploadPDF={triggerFilePicker}
                  onRetryUpload={triggerFilePicker}
               />

               {/* Right Column: Chat Assistant */}
               <div className="lg:col-span-7 h-full">
                  <ChatContainer
                     title="🤖 PDF RAG Assistant"
                     className="h-full w-full shadow-sm border"
                     messages={messages}
                     loading={isChatLoading}
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
