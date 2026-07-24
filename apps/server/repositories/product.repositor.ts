import { getDb } from '../lib/mongodb'
import type { Product } from '../types/product.types'
import { ObjectId } from 'mongodb'

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
   async delete(id: string) {
      try {
         const db = await getDb()
         const collection = db.collection<Product>('products')
         const result = await collection.deleteOne({ _id: new ObjectId(id) })
         console.log('result', result)
         return result.deletedCount === 1
      } catch (e) {
         console.log(e)
         throw new Error('Failed to delete product from database')
      }
   },
}

export default productRepository
