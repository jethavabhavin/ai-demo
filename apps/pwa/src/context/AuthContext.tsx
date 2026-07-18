import { isTokenExpired } from '@/utils/tokenUtils'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type AuthContextType = {
   token: string | null
   isAuthenticated: boolean
   login: (token: string) => void
   logout: () => void
   isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
   const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'))
   const [isLoading, setIsLoading] = useState(true)

   useEffect(() => {
      const storedToken = localStorage.getItem('accessToken')

      if (storedToken && !isTokenExpired(storedToken)) {
         setToken(storedToken)
      } else {
         // expired, invalid, or missing — clear it
         localStorage.removeItem('accessToken')
         setToken(null)
      }

      setIsLoading(false)
   }, [])
   useEffect(() => {
      if (!token) return

      const interval = setInterval(() => {
         if (isTokenExpired(token)) {
            logout()
         }
      }, 30_000)

      return () => clearInterval(interval)
   }, [token])

   const login = (newToken: string) => {
      localStorage.setItem('accessToken', newToken)
      setToken(newToken)
   }

   const logout = () => {
      localStorage.removeItem('accessToken')
      setToken(null)
   }

   return (
      <AuthContext.Provider value={{ token, isAuthenticated: !!token, isLoading, login, logout }}>
         {children}
      </AuthContext.Provider>
   )
}

export function useAuth() {
   const context = useContext(AuthContext)
   if (!context) {
      throw new Error('useAuth must be used within an AuthProvider')
   }
   return context
}
