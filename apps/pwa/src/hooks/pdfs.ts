import { useState, useCallback } from 'react'
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
   const [convId] = useState(() => crypto.randomUUID())

   const { data: pdfs = null, isLoading: isPdfsLoading, refetch: refetchPdfs } = useUserPdfs()
   const uploadMutation = useUploadPdf()
   const chatMutation = usePdfChat()

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

         try {
            await uploadMutation.mutateAsync(file)
            updateUploadStatus('Initializing...', tempName)
            queryClient.invalidateQueries({ queryKey: ['user-pdfs'] })
         } catch (err) {
            console.error('PDF upload failed:', err)
            updateUploadStatus('Failed Upload', tempName)
         }
      },
      [uploadMutation, updateUploadStatus, queryClient],
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
      isChatLoading: chatMutation.isPending,
      isUploading: uploadMutation.isPending,
      sendMessage: handleSendMessage,
      triggerFilePicker,
      handleUploadPdf,
      refetchPdfs,
   }
}
