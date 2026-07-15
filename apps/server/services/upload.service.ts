import uploadRepository from '../repositories/upload.repositor'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) {
   fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

interface UploadStats {
   url: string
   filename: string
   mimetype: string
   size: number
}

interface ParsedDataUrl {
   mimetype: string
   base64Data: string
}

function parseDataUrl(dataUrl: string): ParsedDataUrl {
   const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)

   if (!match) {
      throw new Error('Invalid image data URL')
   }

   const mimetype = match[1]
   const base64Data = match[2]

   if (!mimetype || !base64Data) {
      throw new Error('Invalid image data URL')
   }

   return { mimetype, base64Data }
}

function extensionFromMime(mimetype: string) {
   const map: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
   }
   return map[mimetype] ?? ''
}

export const uploadService = {
   async upload(imageDataUrl: string): Promise<boolean> {
      if (!imageDataUrl || typeof imageDataUrl !== 'string') {
         throw new Error('No image provided')
      }

      const { mimetype, base64Data } = parseDataUrl(imageDataUrl)

      if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
         throw new Error(`Unsupported image type: ${mimetype}`)
      }

      const buffer = Buffer.from(base64Data, 'base64')

      if (buffer.byteLength > MAX_SIZE_BYTES) {
         throw new Error('Image exceeds maximum allowed size (5MB)')
      }

      const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extensionFromMime(mimetype)}`
      const filePath = path.join(UPLOAD_DIR, filename)

      await fs.writeFile(filePath, buffer, () => {})

      const result = await uploadRepository.saveImage(filename)
      return result
   },
}
