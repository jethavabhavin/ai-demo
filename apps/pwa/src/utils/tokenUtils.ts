import { jwtDecode } from 'jwt-decode'

type DecodedToken = {
   id: string
   email: string
   exp: number
   iat: number
}

export function isTokenExpired(token: string): boolean {
   try {
      const decoded = jwtDecode<DecodedToken>(token)
      const currentTime = Date.now() / 1000 // convert to seconds
      return decoded.exp < currentTime
   } catch (err) {
      return true
   }
}
