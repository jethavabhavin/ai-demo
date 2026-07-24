import type { ObjectId } from 'mongodb'

export interface Product {
   _id: ObjectId
   id: string
   name: string
   status: boolean
   price: number
}
