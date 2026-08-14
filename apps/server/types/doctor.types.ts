import type { ObjectId } from 'mongodb'

export interface Doctor {
   _id?: ObjectId
   doctorName: string
   department: string
   specialty: string
   keywords: string[]
}
