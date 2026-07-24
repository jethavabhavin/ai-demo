export default interface Product {
   id: string
   name: string
   status: boolean
   price: number
}

export interface PaginatedData<T> {
   data: T[]
   pagination: {
      page: number
      totalPages: number
      total: number
      hasPrevPage: boolean
      hasNextPage: boolean
   }
}
