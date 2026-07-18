import { number } from 'zod'
import { getDb } from '../lib/mongodb'
import type { Product } from '../types/common.types'

const productRepository = {
   async getProducts(search: string, skip: number, limit: number): Promise<{ data: Product[]; total: number }> {
      try {
         const db = await getDb()
         const collection = db.collection<Product>('products')
         const filter = search ? { name: { $regex: search, $options: 'i' } } : {}
         const total = await collection.countDocuments(filter)
         const data = await collection.find(filter).skip(skip).limit(Number(limit)).toArray()
         return { data, total }
      } catch (e) {
         console.log(e)
         throw new Error('Failed to fetch products from database')
      }
   },
}

export default productRepository
