import React from 'react'
import { Bot, User as UserIcon } from 'lucide-react'
import SlotSelector from './SlotSelector'
import AppointmentCard from './AppointmentCard'

export interface ChatMessageData {
   id: string
   role: 'user' | 'assistant'
   content: string
   intent?: string
   availableSlots?: string[]
   requiresConfirmation?: boolean
   confirmationType?: 'BOOK' | 'RESCHEDULE' | 'CANCEL'
   doctorName?: string
   requestedDate?: string
   preferredTime?: string
   appointmentId?: string
   timestamp?: string
}

interface ChatMessageProps {
   message: ChatMessageData
   onSelectSlot?: (slot: string) => void
   onConfirmAppointment?: () => void
   onDeclineAppointment?: () => void
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
   message,
   onSelectSlot,
   onConfirmAppointment,
   onDeclineAppointment,
}) => {
   const isUser = message.role === 'user'

   return (
      <div className={`flex gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
         <div
            className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-semibold shadow-xs ${
               isUser ? 'bg-blue-600 text-white' : 'bg-linear-to-br from-indigo-600 to-blue-700 text-white'
            }`}
         >
            {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
         </div>

         <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
            <div
               className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  isUser
                     ? 'bg-blue-600 text-white rounded-tr-xs font-medium'
                     : 'bg-white text-gray-800 border border-gray-100 rounded-tl-xs shadow-slate-100'
               }`}
            >
               <div className="whitespace-pre-wrap">{message.content}</div>

               {/* Intent badge for assistant messages */}
               {!isUser && message.intent && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-700">
                     <span>Intent:</span>
                     <span>{message.intent}</span>
                  </div>
               )}

               {/* Render interactive SlotSelector if availableSlots present */}
               {!isUser && message.availableSlots && message.availableSlots.length > 0 && onSelectSlot && (
                  <SlotSelector
                     slots={message.availableSlots}
                     selectedSlot={message.preferredTime}
                     onSelectSlot={onSelectSlot}
                  />
               )}

               {/* Render interactive AppointmentCard if appointment state or confirmation present */}
               {!isUser &&
                  (message.requiresConfirmation ||
                     message.appointmentId ||
                     (message.doctorName && message.requestedDate)) && (
                     <AppointmentCard
                        doctorName={message.doctorName}
                        department={message.intent === 'CLINIC_INFO' ? undefined : 'Cardiology'}
                        date={message.requestedDate}
                        time={message.preferredTime}
                        appointmentId={message.appointmentId}
                        requiresConfirmation={message.requiresConfirmation}
                        confirmationType={message.confirmationType}
                        onConfirm={onConfirmAppointment}
                        onDecline={onDeclineAppointment}
                     />
                  )}
            </div>

            {message.timestamp && (
               <span className={`block mt-1 text-[10px] text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>
                  {message.timestamp}
               </span>
            )}
         </div>
      </div>
   )
}

export default ChatMessage
