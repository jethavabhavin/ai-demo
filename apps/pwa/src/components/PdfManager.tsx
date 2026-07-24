import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, FileCode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PdfManagerProps {
   pdfs: File[] | null
   uploadStatus?: Map<number, string>
   onUploadPDF: () => void
   className?: string
}

export function PdfManager({ pdfs, uploadStatus, onUploadPDF, className }: PdfManagerProps) {
   return (
      <Card className={`flex flex-col h-full overflow-hidden shadow-sm border ${className ?? ''}`}>
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
               onClick={onUploadPDF}
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
                           const status = uploadStatus?.get(idx) ?? 'Pending'
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
   )
}
