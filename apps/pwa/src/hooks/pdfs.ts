import { useState, useCallback, useRef, useEffect } from 'react'
import {
   useQuery,
   useMutation,
   useQueryClient,
   type UseQueryResult,
   type UseMutationResult,
} from '@tanstack/react-query'
import { env } from '@/config/env'
import { useAuth } from '@/context/AuthContext'
import type { UserPdfItem, PdfChatResponse } from '@/type/pdf'
import type { Message } from '@/type/chat'
import type { ToastMessage } from '@/components/ui/toast'

export async function fetchUserPdfs(authToken: string): Promise<UserPdfItem[]> {
   const res = await fetch(`${env.apiUrl}/api/user-pdfs`, {
      headers: {
         Authorization: `Bearer ${authToken}`,
      },
   })
   if (!res.ok) {
      throw new Error('Failed to fetch user PDFs')
   }
   const data = await res.json()
   return data.pdfs || []
}

export async function uploadPdfFile(authToken: string, file: File): Promise<boolean> {
   const formData = new FormData()
   formData.append('pdf', file)

   const res = await fetch(`${env.apiUrl}/api/upload-pdf-rag`, {
      method: 'POST',
      body: formData,
      headers: {
         Authorization: `Bearer ${authToken}`,
      },
   })

   if (!res.ok) {
      throw new Error('Failed to upload PDF')
   }
   return true
}

export async function deletePdfFile(authToken: string, id: string): Promise<boolean> {
   const res = await fetch(`${env.apiUrl}/api/user-pdfs/${id}`, {
      method: 'DELETE',
      headers: {
         Authorization: `Bearer ${authToken}`,
      },
   })

   if (!res.ok) {
      throw new Error('Failed to delete PDF')
   }
   return true
}

export async function sendPdfChatMessage(authToken: string, convId: string, prompt: string): Promise<PdfChatResponse> {
   const res = await fetch(`${env.apiUrl}/api/pdfchat`, {
      method: 'POST',
      headers: {
         Authorization: `Bearer ${authToken}`,
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({ convId, prompt }),
   })

   if (!res.ok) {
      throw new Error('Failed to send PDF chat message')
   }

   const data = await res.json()
   return data.message
}

/**
 * Custom hook to fetch user's PDF documents with automatic background polling
 * while documents are in 'Uploading...' or 'Initializing...' states.
 */
export function useUserPdfs(): UseQueryResult<UserPdfItem[], Error> {
   const { token } = useAuth()
   return useQuery({
      queryKey: ['user-pdfs'],
      queryFn: () => fetchUserPdfs(token!),
      enabled: !!token,
      refetchInterval: (query) => {
         const pdfs = query.state.data
         const isPending = pdfs?.some((p) => p.status === 'Uploading...' || p.status === 'Initializing...')
         return isPending ? 3000 : false
      },
   })
}

/**
 * Custom hook for PDF file upload mutation.
 */
export function useUploadPdf(): UseMutationResult<boolean, Error, File> {
   const { token } = useAuth()
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (file: File) => uploadPdfFile(token!, file),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['user-pdfs'] })
      },
   })
}

/**
 * Custom hook for PDF document deletion mutation.
 */
export function useDeletePdf(): UseMutationResult<boolean, Error, string> {
   const { token } = useAuth()
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (id: string) => deletePdfFile(token!, id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['user-pdfs'] })
      },
   })
}

/**
 * Custom hook for PDF RAG chat interaction.
 */
export function usePdfChat(): UseMutationResult<PdfChatResponse, Error, { convId: string; prompt: string }> {
   const { token } = useAuth()

   return useMutation({
      mutationFn: ({ convId, prompt }) => sendPdfChatMessage(token!, convId, prompt),
   })
}

/**
 * Comprehensive custom hook for managing PDF RAG functionality in components.
 */
export function usePdfRag() {
   const queryClient = useQueryClient()
   const [uploadStatus, setUploadStatus] = useState<Map<string | number, string>>(new Map())
   const [messages, setMessages] = useState<Message[]>([])
   const [prompt, setPrompt] = useState('')
   const [toasts, setToasts] = useState<ToastMessage[]>([])
   const [convId] = useState(() => crypto.randomUUID())

   const prevStatusMapRef = useRef<Map<string, string>>(new Map())

   const addToast = useCallback((type: 'success' | 'info' | 'error', message: string) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, type, message, visible: true }])

      // Fade out animation after 3.5s
      setTimeout(() => {
         setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)))
      }, 3500)

      // Unmount after 4s
      setTimeout(() => {
         setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
   }, [])

   const dismissToast = useCallback((id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
   }, [])

   const { data: pdfs = null, isLoading: isPdfsLoading, refetch: refetchPdfs } = useUserPdfs()
   const uploadMutation = useUploadPdf()
   const deleteMutation = useDeletePdf()
   const chatMutation = usePdfChat()

   // Track status changes and display auto-fading toasts
   useEffect(() => {
      if (!pdfs) return

      const prevMap = prevStatusMapRef.current
      const currentMap = new Map<string, string>()

      pdfs.forEach((pdf) => {
         const key = pdf.name
         const currentStatus = pdf.status || 'Success'
         currentMap.set(key, currentStatus)

         const previousStatus = prevMap.get(key)
         if (previousStatus && previousStatus !== currentStatus) {
            if (currentStatus === 'Initializing...') {
               addToast('info', `📄 '${pdf.name}' uploaded. Initializing vector indexing...`)
            } else if (currentStatus === 'Success' || currentStatus === 'Indexed') {
               addToast('success', `✅ '${pdf.name}' vector indexing completed successfully!`)
            } else if (currentStatus === 'Failed Upload' || currentStatus === 'Failed') {
               addToast('error', `❌ '${pdf.name}' processing failed.`)
            }
         }
      })

      prevStatusMapRef.current = currentMap
   }, [pdfs, addToast])

   const updateUploadStatus = useCallback((status: string, key: string | number) => {
      setUploadStatus((prev) => {
         const next = new Map(prev)
         next.set(key, status)
         return next
      })
   }, [])

   const handleUploadPdf = useCallback(
      async (file: File) => {
         const tempName = file.name
         updateUploadStatus('Uploading...', tempName)
         addToast('info', `📤 Uploading '${tempName}'...`)

         try {
            await uploadMutation.mutateAsync(file)
            updateUploadStatus('Initializing...', tempName)
            queryClient.invalidateQueries({ queryKey: ['user-pdfs'] })
         } catch (err) {
            console.error('PDF upload failed:', err)
            updateUploadStatus('Failed Upload', tempName)
            addToast('error', `❌ Upload failed for '${tempName}'.`)
         }
      },
      [uploadMutation, updateUploadStatus, queryClient, addToast],
   )

   const handleDeletePdf = useCallback(
      async (pdf: UserPdfItem) => {
         if (!pdf._id) return
         try {
            await deleteMutation.mutateAsync(pdf._id)
            addToast('success', `🗑️ Document '${pdf.name}' and associated vectors deleted successfully!`)
         } catch (err) {
            console.error('Failed to delete PDF:', err)
            addToast('error', `❌ Failed to delete '${pdf.name}'.`)
         }
      },
      [deleteMutation, addToast],
   )

   const triggerFilePicker = useCallback(() => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.pdf'
      input.addEventListener('change', async (e: Event) => {
         const target = e.target as HTMLInputElement
         const file = target?.files?.[0]
         if (file) {
            await handleUploadPdf(file)
         }
      })
      input.click()
   }, [handleUploadPdf])

   const handleSendMessage = useCallback(async () => {
      if (!prompt.trim() || chatMutation.isPending) return

      const userMessage: Message = {
         id: crypto.randomUUID(),
         role: 'user',
         message: prompt,
      }

      setMessages((prev) => [...prev, userMessage])
      const currentPrompt = prompt
      setPrompt('')

      try {
         const res = await chatMutation.mutateAsync({ convId, prompt: currentPrompt })

         setMessages((prev) => [
            ...prev,
            {
               id: res.id || crypto.randomUUID(),
               role: 'assistant',
               message: res.message || 'No response received.',
               references: res.references,
            },
         ])
      } catch {
         setMessages((prev) => [
            ...prev,
            {
               id: crypto.randomUUID(),
               role: 'assistant',
               message: 'Something went wrong while processing your request.',
            },
         ])
      }
   }, [prompt, chatMutation, convId])

   return {
      pdfs,
      isPdfsLoading,
      uploadStatus,
      messages,
      prompt,
      setPrompt,
      toasts,
      dismissToast,
      isChatLoading: chatMutation.isPending,
      isUploading: uploadMutation.isPending,
      isDeleting: deleteMutation.isPending,
      sendMessage: handleSendMessage,
      triggerFilePicker,
      handleUploadPdf,
      handleDeletePdf,
      refetchPdfs,
   }
}
