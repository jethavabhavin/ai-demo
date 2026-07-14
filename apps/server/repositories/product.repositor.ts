import { getDb } from '../lib/mongodb'

export interface Product {
   id: number
   name: string
   status: boolean
   price: number
}

const productRepository = {
   async getProducts(): Promise<Product[]> {
      const db = await getDb()
      const products: Product[] = await db.collection<Product>('products').find().toArray()
      return products
   },
}

export default productRepository
