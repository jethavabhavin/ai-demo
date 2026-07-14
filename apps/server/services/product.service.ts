import productRepository from '../repositories/product.repositor'
import type { Product } from '../repositories/product.repositor'

export const productService = {
   async getProducts(): Promise<Product[]> {
      const products = await productRepository.getProducts()
      return products
   },
}
