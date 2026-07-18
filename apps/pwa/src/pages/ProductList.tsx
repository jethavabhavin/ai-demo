import { Table, TableBody, TableHeader, TableCell, TableHead, TableRow } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom'
import { useDeleteProduct, useProducts } from '@/hooks/products'
import { Button } from '@base-ui/react/button'
import { SquarePen, Trash } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type Product from '@/type/product'

export default function ProductList() {
   const navigate = useNavigate()
   const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
   const [searchParams, setSearchParams] = useSearchParams()

   const page = Number(searchParams.get('page')) || 1
   const search = searchParams.get('search') || ''
   const limit = 10

   // local state so the input updates instantly on every keystroke
   const [searchValue, setSearchValue] = useState<string>(search)
   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

   // keep input in sync if URL changes externally (back/forward, shared link)
   useEffect(() => {
      setSearchValue(search)
   }, [search])

   // clear any pending debounce if the component unmounts mid-typing
   useEffect(() => {
      return () => {
         if (debounceRef.current) clearTimeout(debounceRef.current)
      }
   }, [])

   const getStatusLabel = (status: boolean) => (status ? 'Enable' : 'Disabled')
   const deleteProduct = useDeleteProduct()
   const { data, isLoading, isError, isFetching } = useProducts(search, page, limit)

   const goToPage = (newPage: number) => {
      setSearchParams((prev) => {
         const params = new URLSearchParams(prev)
         params.set('page', String(newPage))
         return params
      })
   }

   const handleSearchChange = (value: string) => {
      setSearchValue(value) // instant visual feedback

      if (debounceRef.current) {
         clearTimeout(debounceRef.current) // cancel the previous pending update
      }

      debounceRef.current = setTimeout(() => {
         setSearchParams((prev) => {
            const params = new URLSearchParams(prev)
            if (value) {
               params.set('search', value)
            } else {
               params.delete('search')
            }
            params.set('page', '1')
            return params
         })
      }, 500)
   }

   const handleEdit = (id: string) => {
      navigate(`/products/${id}`)
   }

   const handleConfirmDelete = () => {
      if (deleteTarget) {
         deleteProduct.mutate(deleteTarget.id)
         setDeleteTarget(null)
      }
   }

   const handleDeleteClick = (product: Product) => {
      setDeleteTarget({ id: product.id, name: product.name })
   }

   if (isLoading) return <p>Loading...</p>
   if (isError) return <p>Failed to load products.</p>

   const { data: products, pagination } = data!

   return (
      <div className="mx-auto max-w-2xl p-6">
         <h2 className="mb-4 text-xl font-semibold text-gray-800">Products</h2>
         <input
            type="text"
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
         />
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Action</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {products.map((product) => (
                  <TableRow key={product.id}>
                     <TableCell className="font-medium">{product.name}</TableCell>
                     <TableCell>{getStatusLabel(product.status)}</TableCell>
                     <TableCell className="text-right">{product.price}</TableCell>
                     <TableCell className="text-right">
                        <Button onClick={() => handleEdit(product.id)}>
                           <SquarePen className="text-gray-700 w-6 h-6 p-1" />
                        </Button>
                        <Button onClick={() => handleDeleteClick(product)}>
                           <Trash className="text-gray-700 w-6 h-6 p-1" />
                        </Button>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
         <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
               Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
               <button
                  onClick={() => goToPage(page - 1)}
                  disabled={!pagination.hasPrevPage || isFetching}
                  className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  Previous
               </button>
               <button
                  onClick={() => goToPage(page + 1)}
                  disabled={!pagination.hasNextPage || isFetching}
                  className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  Next
               </button>
            </div>
         </div>
         <ConfirmDialog
            open={!!deleteTarget}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Delete product"
            description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            variant="destructive"
            isLoading={deleteProduct.isPending}
            onConfirm={handleConfirmDelete}
         />
      </div>
   )
}
