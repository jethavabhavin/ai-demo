import React from 'react'
import { Calendar, Clock, User, Stethoscope, CheckCircle, AlertTriangle } from 'lucide-react'

interface AppointmentCardProps {
   doctorName?: string
   department?: string
   date?: string
   time?: string
   appointmentId?: string
   requiresConfirmation?: boolean
   confirmationType?: 'BOOK' | 'RESCHEDULE' | 'CANCEL'
   onConfirm?: () => void
   onDecline?: () => void
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
   doctorName,
   department,
   date,
   time,
   appointmentId,
   requiresConfirmation,
   confirmationType,
   onConfirm,
   onDecline,
}) => {
   if (!doctorName && !date && !appointmentId) return null

   // const isBooking = confirmationType === 'BOOK' || !confirmationType
   const isReschedule = confirmationType === 'RESCHEDULE'
   const isCancel = confirmationType === 'CANCEL'

   return (
      <div className="mt-3 rounded-2xl border border-blue-200 bg-linear-to-br from-white via-blue-50/30 to-indigo-50/50 p-4 shadow-xs">
         <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
            <div className="flex items-center gap-2">
               <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Stethoscope className="h-4 w-4" />
               </div>
               <span className="text-sm font-semibold text-gray-900">
                  {isCancel
                     ? 'Appointment Cancellation'
                     : isReschedule
                       ? 'Appointment Reschedule'
                       : 'Appointment Details'}
               </span>
            </div>
            {appointmentId && (
               <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-mono font-medium text-blue-800">
                  {appointmentId}
               </span>
            )}
         </div>

         <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-gray-700">
               <User className="h-3.5 w-3.5 text-blue-500 shrink-0" />
               <div>
                  <span className="text-gray-400 block text-[10px]">Doctor</span>
                  <span className="font-semibold">{doctorName || 'Dr. Patel'}</span>
               </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
               <Stethoscope className="h-3.5 w-3.5 text-blue-500 shrink-0" />
               <div>
                  <span className="text-gray-400 block text-[10px]">Specialty</span>
                  <span className="font-semibold">{department || 'Cardiology'}</span>
               </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
               <Calendar className="h-3.5 w-3.5 text-blue-500 shrink-0" />
               <div>
                  <span className="text-gray-400 block text-[10px]">Date</span>
                  <span className="font-semibold">{date || 'Tomorrow'}</span>
               </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
               <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
               <div>
                  <span className="text-gray-400 block text-[10px]">Time Slot</span>
                  <span className="font-semibold">{time || '11:00 AM'}</span>
               </div>
            </div>
         </div>

         {requiresConfirmation && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
               <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                     {isCancel
                        ? 'Confirm cancellation of this appointment?'
                        : isReschedule
                          ? 'Confirm rescheduling to the new date/time?'
                          : 'Confirm booking this appointment?'}
                  </span>
               </div>
               <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                     onClick={onDecline}
                     className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                     Decline
                  </button>
                  <button
                     onClick={onConfirm}
                     className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all ${
                        isCancel ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                     }`}
                  >
                     <CheckCircle className="h-3.5 w-3.5" />
                     <span>{isCancel ? 'Confirm Cancellation' : 'Confirm Appointment'}</span>
                  </button>
               </div>
            </div>
         )}
      </div>
   )
}

export default AppointmentCard
