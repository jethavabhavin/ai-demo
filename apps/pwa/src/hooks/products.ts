// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query'
import type Product from '@/type/product'
import { env } from '@/config/env'

async function fetchProducts(): Promise<{ data: Product[] }> {
   const res = await fetch(env.apiUrl + '/api/products')
   if (!res.ok) {
      throw new Error('Failed to fetch products')
   }
   return res.json()
}

export function useProducts() {
   const queryResult = useQuery({
      queryKey: ['products'],
      queryFn: fetchProducts,
   })

   return {
      products: queryResult.data?.data as Product[],
      ...queryResult,
   }
}
