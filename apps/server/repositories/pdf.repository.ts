import { getDb } from '../lib/mongodb'
import { ObjectId } from 'mongodb'
import type { PdfDocument, PdfStatus } from '../types/pdf.types'

export type { PdfDocument, PdfStatus }

const pdfRepository = {
   async savePdf(pdf: Omit<PdfDocument, '_id' | 'createdAt'>): Promise<PdfDocument> {
      const db = await getDb()
      const newPdf: PdfDocument = {
         ...pdf,
         createdAt: new Date(),
      }
      const result = await db.collection<PdfDocument>('pdf_documents').insertOne(newPdf as any)
      return { ...newPdf, _id: result.insertedId.toString() }
   },

   async getUserPdfs(userId: string): Promise<PdfDocument[]> {
      const db = await getDb()
      const pdfs = await db.collection<PdfDocument>('pdf_documents').find({ userId }).sort({ createdAt: -1 }).toArray()
      return pdfs.map((pdf) => ({
         ...pdf,
         _id: pdf._id?.toString(),
      }))
   },

   async updatePdfStatus(id: string, status: PdfStatus): Promise<boolean> {
      const db = await getDb()
      let filter: any = {}
      try {
         filter = { _id: new ObjectId(id) }
      } catch {
         filter = { _id: id }
      }
      const result = await db.collection('pdf_documents').updateOne(filter, {
         $set: { status },
      })
      return result.modifiedCount > 0
   },

   async getPdfByFilename(filename: string): Promise<PdfDocument | null> {
      const db = await getDb()
      const pdf = await db.collection<PdfDocument>('pdf_documents').findOne({ filename })
      if (!pdf) return null
      return { ...pdf, _id: pdf._id?.toString() }
   },
}

export default pdfRepository
