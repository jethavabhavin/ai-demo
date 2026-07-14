// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query'
import type Product from '@/type/product'

async function fetchProducts(): Promise<{ data: Product[] }> {
   const res = await fetch('/api/products')
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
