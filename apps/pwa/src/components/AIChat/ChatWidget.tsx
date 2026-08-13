import React, { useState } from 'react'
import ChatWindow from './ChatWindow'

export const ChatWidget: React.FC = () => {
   const [isOpen, setIsOpen] = useState(false)

   return (
      <>
         {/* Floating bottom-right widget button */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all ring-2 ring-white/30"
         >
            <span className="text-base">🤖</span>
            <span>Clinic AI Assistant</span>
            <span className="relative flex h-2.5 w-2.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
         </button>

         {/* Chat Modal Window */}
         <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
   )
}

export default ChatWidget
