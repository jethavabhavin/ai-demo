import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { loginRequest } from '@/api/uAuth'

export default function Login() {
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')

   const { login } = useAuth()
   const navigate = useNavigate()

   const loginMutation = useMutation({
      mutationFn: loginRequest,
      onSuccess: (data) => {
         login(data.token)
         navigate('/products')
      },
   })

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      loginMutation.mutate({ email, password })
   }

   return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
         <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
            <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">Sign in to your account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                     placeholder="you@example.com"
                  />
               </div>

               <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                  <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                     placeholder="••••••••"
                  />
               </div>

               {loginMutation.isError && (
                  <p className="text-sm text-red-600">{(loginMutation.error as Error).message}</p>
               )}

               <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
               >
                  {loginMutation.isPending ? 'Logging in...' : 'Login'}
               </button>
            </form>
         </div>
      </div>
   )
}
