import React, { useState, useEffect, useRef } from 'react'
import { X, Bot, ShieldCheck, Activity, RefreshCw, BarChart2 } from 'lucide-react'
import ChatMessage, { type ChatMessageData } from './ChatMessage'
import ChatInput from './ChatInput'
import { sendClinicChatMessageStream, runClinicEvaluation } from '../../services/chatApi'

interface ChatWindowProps {
   isOpen: boolean
   onClose: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
   const [messages, setMessages] = useState<ChatMessageData[]>([
      {
         id: 'welcome',
         role: 'assistant',
         content:
            'Hello! 👋 Welcome to **Apex Health Clinic**. I am your AI receptionist powered by **LangGraph**.\n\nHow can I help you today? You can ask about our doctors, clinic timings, services, check slot availability, or book/reschedule an appointment.',
         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
   ])
   const [isLoading, setIsLoading] = useState(false)
   const [sessionId] = useState(() => `sess_${Math.random().toString(36).substring(2, 9)}`)
   const [evalResults, setEvalResults] = useState<any>(null)
   const [isEvaluating, setIsEvaluating] = useState(false)
   const [showEvalModal, setShowEvalModal] = useState(false)
   const messagesEndRef = useRef<HTMLDivElement>(null)

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
   }

   useEffect(() => {
      if (isOpen) {
         scrollToBottom()
      }
   }, [messages, isOpen])

   const handleSendMessage = async (text: string) => {
      const userMsg: ChatMessageData = {
         id: `usr_${Date.now()}`,
         role: 'user',
         content: text,
         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      const assistantMsgId = `ast_${Date.now()}`
      const initialAssistantMsg: ChatMessageData = {
         id: assistantMsgId,
         role: 'assistant',
         content: '',
         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, userMsg, initialAssistantMsg])
      setIsLoading(true)

      await sendClinicChatMessageStream(
         text,
         sessionId,
         // 1. On streaming token delta
         (tokenChunk: string) => {
            setMessages((prev) =>
               prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, content: msg.content + tokenChunk } : msg)),
            )
         },
         // 2. On stream completion metadata
         (metadata) => {
            setMessages((prev) =>
               prev.map((msg) =>
                  msg.id === assistantMsgId
                     ? {
                          ...msg,
                          intent: metadata.intent,
                          availableSlots: metadata.availableSlots,
                          requiresConfirmation: metadata.requiresConfirmation,
                          confirmationType: metadata.confirmationType,
                          doctorName: metadata.doctorName,
                          requestedDate: metadata.requestedDate,
                          preferredTime: metadata.preferredTime,
                          appointmentId: metadata.appointmentId,
                       }
                     : msg,
               ),
            )
            setIsLoading(false)
         },
         // 3. On stream error
         (errorMsg) => {
            setMessages((prev) =>
               prev.map((msg) =>
                  msg.id === assistantMsgId
                     ? { ...msg, content: `Sorry, I encountered an error: ${errorMsg}. Please try again.` }
                     : msg,
               ),
            )
            setIsLoading(false)
         },
      )
   }

   const handleSelectSlot = (slot: string) => {
      handleSendMessage(`Book appointment for ${slot}`)
   }

   const handleConfirmAppointment = () => {
      handleSendMessage('Confirm')
   }

   const handleDeclineAppointment = () => {
      handleSendMessage('Cancel')
   }

   const handleRunEvaluation = async () => {
      setIsEvaluating(true)
      try {
         const res = await runClinicEvaluation()
         setEvalResults(res)
      } catch (err) {
         console.error('Eval error:', err)
      } finally {
         setIsEvaluating(false)
      }
   }

   if (!isOpen) return null

   return (
      <div className="fixed bottom-20 right-6 z-50 flex h-155 w-105 max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white/95 shadow-2xl backdrop-blur-xl transition-all">
         {/* Glassmorphic Header */}
         <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 px-4 py-3.5 text-white shadow-xs">
            <div className="flex items-center gap-3">
               <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
                  <Bot className="h-5 w-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-blue-700" />
               </div>
               <div>
                  <h3 className="text-xs font-bold tracking-wide">Clinic AI Assistant</h3>
                  <div className="flex items-center gap-1 text-[10px] text-blue-100">
                     <ShieldCheck className="h-3 w-3 text-emerald-300" />
                     <span>LangGraph Agent • SSE Real-Time Streaming</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-1.5">
               <button
                  onClick={() => {
                     setShowEvalModal(!showEvalModal)
                     if (!evalResults) handleRunEvaluation()
                  }}
                  title="Run LangSmith Evaluation Suite"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
               >
                  <BarChart2 className="h-4 w-4" />
               </button>
               <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
               >
                  <X className="h-4 w-4" />
               </button>
            </div>
         </div>

         {/* LangSmith Evaluation Suite Drawer */}
         {showEvalModal && (
            <div className="border-b border-blue-100 bg-blue-50/90 p-3 text-xs">
               <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 flex items-center gap-1">
                     <Activity className="h-3.5 w-3.5 text-blue-600" />
                     LangSmith Agent Evaluation Suite
                  </span>
                  <button
                     onClick={handleRunEvaluation}
                     disabled={isEvaluating}
                     className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                     <RefreshCw className={`h-3 w-3 ${isEvaluating ? 'animate-spin' : ''}`} />
                     {isEvaluating ? 'Testing...' : 'Re-run'}
                  </button>
               </div>

               {evalResults ? (
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[11px]">
                     <div className="rounded-lg bg-white p-2 shadow-2xs">
                        <span className="block text-gray-400 text-[9px]">Intent Accuracy</span>
                        <span className="font-bold text-emerald-600">{evalResults.intentAccuracy}%</span>
                     </div>
                     <div className="rounded-lg bg-white p-2 shadow-2xs">
                        <span className="block text-gray-400 text-[9px]">Guardrail Safety</span>
                        <span className="font-bold text-blue-600">{evalResults.guardrailCompliance}%</span>
                     </div>
                     <div className="rounded-lg bg-white p-2 shadow-2xs">
                        <span className="block text-gray-400 text-[9px]">Tests Passed</span>
                        <span className="font-bold text-indigo-600">
                           {evalResults.passed}/{evalResults.totalTests}
                        </span>
                     </div>
                  </div>
               ) : (
                  <p className="mt-2 text-[11px] text-blue-700">Running safety and accuracy test cases...</p>
               )}
            </div>
         )}

         {/* Messages Area */}
         <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {messages.map((msg) => (
               <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSelectSlot={handleSelectSlot}
                  onConfirmAppointment={handleConfirmAppointment}
                  onDeclineAppointment={handleDeclineAppointment}
               />
            ))}
            {isLoading && !messages[messages.length - 1]?.content && (
               <div className="my-2 flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-2.5 text-xs text-gray-500 w-fit border border-gray-100">
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span>AI receptionist is typing...</span>
               </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Chat Input */}
         <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
   )
}

export default ChatWindow
