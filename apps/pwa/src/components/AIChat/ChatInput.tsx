import React, { useState, type KeyboardEvent } from 'react'
import { Send, Loader2, Sparkles } from 'lucide-react'

interface ChatInputProps {
   onSend: (message: string) => void
   isLoading: boolean
}

const QUICK_PROMPTS = [
   'What time does the clinic open?',
   'Who is the cardiologist?',
   'Check Dr Patel availability tomorrow',
   'Book cardiology appointment tomorrow 11 AM',
   'Cancel my appointment APT-1001',
   'Write Python code',
   'What medicine should I take for headache?',
]

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
   const [text, setText] = useState('')

   const handleSend = () => {
      if (!text.trim() || isLoading) return
      onSend(text.trim())
      setText('')
   }

   const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault()
         handleSend()
      }
   }

   return (
      <div className="border-t border-gray-100 bg-white p-3.5">
         {/* Quick Prompt Chips */}
         <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-gray-500 scrollbar-none">
            <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="text-[11px] font-medium text-gray-400 shrink-0">Quick Ask:</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
               <button
                  key={idx}
                  onClick={() => onSend(prompt)}
                  disabled={isLoading}
                  className="shrink-0 rounded-full border border-blue-100 bg-blue-50/60 px-3 py-1 text-[11px] font-medium text-blue-800 transition-colors hover:bg-blue-100 disabled:opacity-50"
               >
                  {prompt}
               </button>
            ))}
         </div>

         <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
               type="text"
               value={text}
               onChange={(e) => setText(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Ask about clinic hours, doctors, or book an appointment..."
               disabled={isLoading}
               className="flex-1 bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-hidden disabled:opacity-50"
            />
            <button
               onClick={handleSend}
               disabled={!text.trim() || isLoading}
               className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-700 active:scale-95 disabled:bg-gray-300 disabled:opacity-50"
            >
               {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
         </div>
      </div>
   )
}

export default ChatInput
