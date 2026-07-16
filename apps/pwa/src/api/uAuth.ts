import { env } from '@/config/env'

type LoginPayload = {
   email: string
   password: string
}

type LoginResponse = {
   id: string
   token: string
   message: string
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
   const res = await fetch(`${env.apiUrl}/api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
   })

   if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Invalid credentials')
   }

   return res.json()
}
