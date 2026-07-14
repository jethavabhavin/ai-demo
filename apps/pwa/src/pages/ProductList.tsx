import { Table, TableBody, TableHeader, TableCell, TableHead, TableRow, TableCaption } from '@/components/ui/table'
import { useProducts } from '@/hooks/products'

export default function ProductList() {
   const getStatusLabel = (status: boolean) => (status ? 'Enable' : 'Disabled')
   const { products, isLoading, isError } = useProducts()
   if (isLoading) return <p>Loading...</p>
   if (isError) return <p>Failed to load products.</p>

   return (
      <Table>
         <TableCaption>Products</TableCaption>
         <TableHeader>
            <TableRow>
               <TableHead className="w-[100px]">Name</TableHead>
               <TableHead>Status</TableHead>
               <TableHead className="text-right">Price</TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {products.map((product) => (
               <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{getStatusLabel(product.status)}</TableCell>
                  <TableCell className="text-right">{product.price}</TableCell>
               </TableRow>
            ))}
         </TableBody>
      </Table>
   )
}
