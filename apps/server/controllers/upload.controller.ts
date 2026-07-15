import type { Request, Response } from 'express'
import { uploadService } from '../services/upload.service'

export const UploadController = {
   async upload(req: Request, res: Response) {
      try {
         console.log(req.body)
         const stats = await uploadService.upload(req.body.image)
         res.json({ stats })
      } catch (e) {
         console.error('Upload failed:', e)
         res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to upload image.' })
      }
   },
}
