export interface ChatResponse {
   message: string
   intent?: string
   availableSlots?: string[]
   requiresConfirmation?: boolean
   confirmationType?: 'BOOK' | 'RESCHEDULE' | 'CANCEL'
   doctorName?: string
   requestedDate?: string
   preferredTime?: string
   appointmentId?: string
   toolResult?: any
   sessionId?: string
   error?: string
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002'

export async function sendClinicChatMessageStream(
   prompt: string,
   sessionId: string | undefined,
   onToken: (token: string) => void,
   onComplete: (metadata: Partial<ChatResponse>) => void,
   onError: (error: string) => void,
): Promise<void> {
   const token = localStorage.getItem('token') || ''
   const headers: Record<string, string> = {
      'Content-Type': 'application/json',
   }
   if (token) {
      headers['Authorization'] = `Bearer ${token}`
   }

   try {
      const res = await fetch(`${API_BASE}/api/clinic/chat/stream`, {
         method: 'POST',
         headers,
         body: JSON.stringify({ prompt, sessionId }),
      })

      if (!res.ok || !res.body) {
         throw new Error(`Streaming failed with status: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
         const { value, done } = await reader.read()
         if (done) break

         buffer += decoder.decode(value, { stream: true })
         const lines = buffer.split('\n\n')
         buffer = lines.pop() || ''

         for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('data: ')) {
               const jsonStr = trimmed.slice(6)
               try {
                  const event = JSON.parse(jsonStr)
                  if (event.type === 'token') {
                     onToken(event.content)
                  } else if (event.type === 'done') {
                     onComplete(event.metadata || {})
                  } else if (event.type === 'error') {
                     onError(event.error || 'Streaming error')
                  }
               } catch (e) {
                  // Ignore JSON parse chunk errors
               }
            }
         }
      }
   } catch (err: any) {
      onError(err.message || 'Stream processing error')
   }
}

export async function fetchClinicSlots(
   doctorName?: string,
   date?: string,
): Promise<{ available: boolean; slots: string[] }> {
   const params = new URLSearchParams()
   if (doctorName) params.append('doctorName', doctorName)
   if (date) params.append('date', date)

   const res = await fetch(`${API_BASE}/api/clinic/slots?${params.toString()}`)
   if (!res.ok) {
      throw new Error('Failed to fetch slot availability')
   }
   return res.json()
}

export async function runClinicEvaluation(): Promise<any> {
   const res = await fetch(`${API_BASE}/api/clinic/eval`, { method: 'POST' })
   return res.json()
}

export async function fetchClinicMetrics(): Promise<any> {
   const res = await fetch(`${API_BASE}/api/clinic/metrics`)
   return res.json()
}
