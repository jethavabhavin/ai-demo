// hooks/useProducts.ts
import {
   keepPreviousData,
   useMutation,
   useQuery,
   useQueryClient,
   type UseMutationResult,
   type UseQueryResult,
} from '@tanstack/react-query'
import type Product from '@/type/product'
import { env } from '@/config/env'
import { useAuth } from '@/context/AuthContext'
interface PaginatedData<T> {
   data: T[]
   pagination: {
      page: number
      totalPages: number
      total: number
      hasPrevPage: boolean
      hasNextPage: boolean
   }
}
async function fetchProducts(
   authToken: string,
   search?: string,
   page?: number,
   limit?: number,
): Promise<PaginatedData<Product>> {
   const queryParams = new URLSearchParams()
   if (search) queryParams.set('search', search)
   if (page) queryParams.set('page', page.toString())
   if (limit) queryParams.set('limit', limit.toString())
   const url = `${env.apiUrl}/api/products?${queryParams}`

   const res = await fetch(url, {
      method: 'GET',
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${authToken}`,
      },
   })
   if (!res.ok) {
      throw new Error('Failed to fetch products')
   }
   return res.json()
}

async function deleteProduct(authToken: string, id: string): Promise<void> {
   const url = `${env.apiUrl}/api/products/${id}`
   const res = await fetch(url, {
      method: 'DELETE',
      headers: {
         Authorization: `Bearer ${authToken}`,
      },
   })
   if (!res.ok) {
      throw new Error('Failed to delete product')
   }
   // No need to parse response body for delete operation
   return
}

export function useProducts(
   search: string,
   page: number,
   limit: number,
): UseQueryResult<PaginatedData<Product>, Error> {
   const { token } = useAuth()
   const queryResult = useQuery({
      queryKey: ['products'],
      queryFn: () => fetchProducts(token!, search, page, limit),
      enabled: !!token,
      placeholderData: keepPreviousData,
   })

   return {
      data: queryResult.data,
      ...queryResult,
   }
}

export function useDeleteProduct(): UseMutationResult<void, Error, string> {
   const { token } = useAuth()
   const queryClient = useQueryClient()
   const deleteProductMutation = useMutation({
      mutationFn: async (id: string) => await deleteProduct(token!, id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['products'] })
      },
   })
   return deleteProductMutation
}
