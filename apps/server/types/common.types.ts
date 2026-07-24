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
