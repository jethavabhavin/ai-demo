export type PdfStatus = 'Uploading...' | 'Initializing...' | 'Success' | 'Failed Upload'

export interface UserPdfItem {
   _id?: string
   name: string
   size: number
   status?: string
   url?: string
}

export interface ReferencePdf {
   name: string
   url: string
}

export interface PdfChatResponse {
   id: string
   message: string
   references?: ReferencePdf[]
}
