import { useState } from 'react'
import { UploadCloud } from 'lucide-react'

export default function PDFRag() {
   const [pdfs, setPdfs] = useState<File[] | null>(null)
   const [uploadStatus, setUploadStatus] = useState<Map<number, string>>()
   const updateUploadStatus = (status: string, index: number) => {
      setUploadStatus((prev) => {
         let arr = new Map(prev)
         arr.set(index, status)
         return arr
      })
   }
   const uploadPDF = async (formData: FormData, index: number) => {
      try {
         const res = await fetch('/api/upload-pdf-rag', {
            method: 'POST',
            body: formData,
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
         <div className="w-full max-w-7xl rounded-xl bg-white p-8 shadow-md">
            <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">PDF RAG</h2>
            <div className="flex w-full max-h-screen">
               <div className="p-2 w-[50%] h-[70vh] border-2 border-dashed rounded-xl">
                  <div className="bg-gray-50 p-2 gap-1">
                     List of pdf
                     <ul className="w-fill">
                        {pdfs?.map((pdf, idx) => (
                           <li className={`p-2 m-1 rounded ${idx % 2 == 0 ? 'bg-blue-100' : 'bg-gray-50'}`} key={idx}>
                              <div className="flex">
                                 <div className="p-1">{pdf.name}</div>
                                 <div className="p-1">{uploadStatus?.get(idx)}</div>
                              </div>
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div
                     className="flex bg-gray-100 max-h-16 items-center justify-center border-2 rounded p-2 w-full h-full gap-2"
                     onClick={pdfUploadHandler}
                  >
                     <label>Upload PDF </label>
                     <UploadCloud className="h-6 w-6" />
                  </div>
               </div>
               <div className="w-[50%] h-[70vh] border-2 border-dashed rounded-xl">Chat</div>
            </div>
         </div>
      </div>
   )
}
