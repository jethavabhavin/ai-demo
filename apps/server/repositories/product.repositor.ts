export interface Product {
   id: number
   name: string
   status: boolean
   price: number
}

const productRepository = {
   getProducts() {
      const products: Product[] = [
         {
            id: 1,
            name: 'T-Shirt',
            status: true,
            price: 100,
         },
         {
            id: 2,
            name: 'Mobile',
            status: true,
            price: 2500,
         },
         {
            id: 3,
            name: 'Laptop',
            status: false,
            price: 4500,
         },
      ]

      return products
   },
}

export default productRepository
