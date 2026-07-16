// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query'
import type Product from '@/type/product'
import { env } from '@/config/env'
import { useAuth } from '@/context/AuthContext'
async function fetchProducts(authToken: string): Promise<{ data: Product[] }> {
   const res = await fetch(env.apiUrl + '/api/products', { headers: { Authorization: `Bearer ${authToken}` } })
   if (!res.ok) {
      throw new Error('Failed to fetch products')
   }
   return res.json()
}

export function useProducts() {
   const { token } = useAuth()
   const queryResult = useQuery({
      queryKey: ['products'],
      queryFn: () => fetchProducts(token),
   })

   return {
      products: queryResult.data?.data as Product[],
      ...queryResult,
   }
}
