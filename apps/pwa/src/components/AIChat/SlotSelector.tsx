import React from 'react'
import { Clock } from 'lucide-react'

interface SlotSelectorProps {
   slots: string[]
   selectedSlot?: string
   onSelectSlot: (slot: string) => void
}

export const SlotSelector: React.FC<SlotSelectorProps> = ({ slots, selectedSlot, onSelectSlot }) => {
   if (!slots || slots.length === 0) return null

   return (
      <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
         <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-blue-900">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            <span>Select an available time slot:</span>
         </div>
         <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
               const isSelected = selectedSlot === slot
               return (
                  <button
                     key={slot}
                     onClick={() => onSelectSlot(slot)}
                     className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all shadow-xs ${
                        isSelected
                           ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1'
                           : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                     }`}
                  >
                     {slot}
                  </button>
               )
            })}
         </div>
      </div>
   )
}

export default SlotSelector
