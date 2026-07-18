import type { ObjectId } from 'mongodb'
export type Pagination = {
   page: number
   limit: number
   totalPages: number
   total: number
   hasPrevPage: boolean
   hasNextPage: boolean
}

export type PaginatedResponse<T> = {
   data: T[]
   pagination: Pagination
}

export interface Product {
   _id: ObjectId
   id: string
   name: string
   status: boolean
   price: number
}
