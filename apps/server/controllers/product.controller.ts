import type { Request, Response } from 'express'
import { productService } from '../services/product.service'

export const ProductController = {
   async getProducts(req: Request, res: Response) {
      try {
         const product = await productService.getProducts()
         res.json({ data: product })
      } catch (e) {
         res.status(500).json({ error: 'Failed to generate response.' })
      }
   },
}
