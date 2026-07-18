import productRepository from '../repositories/product.repositor'
import type { PaginatedResponse, Product } from '../types/common.types'

export const productService = {
   async getProducts(search: string = '', limit: number = 10, page: number = 1): Promise<PaginatedResponse<Product>> {
      const skip = (page - 1) * limit
      const { data, total } = await productRepository.getProducts(search, skip, limit)
      const totalPages = Math.ceil(total / limit)
      const pagination = {
         page,
         limit,
         totalPages,
         total,
         hasPrevPage: page > 1,
         hasNextPage: page < totalPages,
      }
      return { data, pagination }
   },
}
