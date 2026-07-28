import productRepository from '../repositories/product.repositor'
import type { PaginatedResponse } from '../types/common.types'
import type { Product } from '../types/product.types'

export class ProductService {
   async getProducts(search: string = '', limit: number = 10, page: number = 1): Promise<PaginatedResponse<Product>> {
      const skip = (page - 1) * limit
      const { data, total } = await productRepository.getProducts(search, skip, limit)
      const newData = data.map((product) => {
         return {
            ...product,
            id: product._id.toString(),
         }
      })
      const totalPages = Math.ceil(total / limit)
      const pagination = {
         page,
         limit,
         totalPages,
         total,
         hasPrevPage: page > 1,
         hasNextPage: page < totalPages,
      }
      return { data: newData, pagination }
   }
   async deleteProduct(id: string): Promise<boolean> {
      const result = await productRepository.delete(id)
      return result
   }
}

export const productService = new ProductService()
export default productService
