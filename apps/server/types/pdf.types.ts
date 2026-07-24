import type { ObjectId } from 'mongodb'

export type PdfStatus = 'Uploading...' | 'Initializing...' | 'Success' | 'Failed Upload'

export interface PdfDocument {
   _id?: string | ObjectId
   userId: string
   originalName: string
   filename: string
   path: string
   mimeType: string
   size: number
   status: PdfStatus
   createdAt: Date
}
