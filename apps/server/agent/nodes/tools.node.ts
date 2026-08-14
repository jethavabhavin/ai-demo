import type { ClinicAgentStateType } from '../state'
import {
   checkSlotAvailabilityTool,
   createAppointmentTool,
   rescheduleAppointmentTool,
   cancelAppointmentTool,
} from '../tools'

export async function toolsNode(state: ClinicAgentStateType): Promise<Partial<ClinicAgentStateType>> {
   const intent = state.intent
   const doctorName = state.doctorName || state.department || ''
   const requestedDate = state.requestedDate
   const preferredTime = state.preferredTime || state.selectedSlot

   try {
      // 1. CHECK AVAILABILITY TOOL EXECUTION
      if (intent === 'CHECK_AVAILABILITY' && requestedDate) {
         const toolResultStr = await checkSlotAvailabilityTool.invoke({
            doctorName,
            date: requestedDate,
            preferredTime,
         })
         const toolResult = JSON.parse(toolResultStr)
         const availableSlots: string[] = toolResult.slots || []

         return {
            availableSlots,
            toolResult,
            finalResponse: `Here are the available slots for **${doctorName || 'Doctor'}** on **${requestedDate}**:\n\n${availableSlots
               .map((s) => `• **${s}**`)
               .join('\n')}\n\nPlease select or type your preferred time to proceed with booking.`,
         }
      }

      // 2. CREATE APPOINTMENT TOOL EXECUTION
      if (
         intent === 'BOOK_APPOINTMENT' &&
         state.patientName &&
         state.phone &&
         state.email &&
         requestedDate &&
         preferredTime
      ) {
         if (state.requiresConfirmation && !state.finalResponse?.includes('Confirmed')) {
            // Pending user confirmation, return current prompt
            return {}
         }

         const toolResultStr = await createAppointmentTool.invoke({
            patientName: state.patientName,
            phone: state.phone,
            email: state.email,
            doctorName: state.doctorName || state.department || 'General Doctor',
            department: state.department || state.doctorName || 'General',
            date: requestedDate,
            time: preferredTime,
         })
         const toolResult = JSON.parse(toolResultStr)
         if (!toolResult.success) {
            return {
               requiresConfirmation: false,
               error: toolResult.error,
               finalResponse: `Failed to create appointment: ${toolResult.error}`,
            }
         }
         const record = toolResult.appointment

         return {
            requiresConfirmation: false,
            confirmationType: undefined,
            appointmentId: record.id,
            toolResult: record,
            finalResponse: `🎉 **Appointment Confirmed!**\n\n- **Appointment ID**: \`${record.id}\`\n- **Patient**: ${record.patientName}\n- **Doctor**: ${record.doctorName}\n- **Department**: ${record.department}\n- **Date**: ${record.date}\n- **Time**: ${record.time}\n- **Google Calendar Event**: Created & synced.\n\nA calendar invite has been sent to your email (${record.email}).`,
         }
      }

      // 3. RESCHEDULE APPOINTMENT TOOL EXECUTION
      if (
         intent === 'RESCHEDULE_APPOINTMENT' &&
         (state.appointmentId || state.phone) &&
         requestedDate &&
         preferredTime
      ) {
         if (state.requiresConfirmation && !state.finalResponse?.includes('Rescheduled')) {
            return {}
         }

         const identifier = state.appointmentId || state.phone!
         const toolResultStr = await rescheduleAppointmentTool.invoke({
            appointmentIdOrPhone: identifier,
            newDate: requestedDate,
            newTime: preferredTime,
         })
         const toolResult = JSON.parse(toolResultStr)
         if (!toolResult.success) {
            return {
               requiresConfirmation: false,
               error: toolResult.error,
               finalResponse: `Failed to reschedule appointment: ${toolResult.error}`,
            }
         }
         const record = toolResult.appointment

         return {
            requiresConfirmation: false,
            confirmationType: undefined,
            appointmentId: record.id,
            toolResult: record,
            finalResponse: `✅ **Appointment Rescheduled!**\n\n- **Appointment ID**: \`${record.id}\`\n- **Doctor**: ${record.doctorName}\n- **New Date**: ${record.date}\n- **New Time**: ${record.time}\n- **Status**: Rescheduled & synced to Google Calendar.`,
         }
      }

      // 4. CANCEL APPOINTMENT TOOL EXECUTION
      if (intent === 'CANCEL_APPOINTMENT' && (state.appointmentId || state.phone)) {
         if (state.requiresConfirmation && !state.finalResponse?.includes('Cancelled')) {
            return {}
         }

         const identifier = state.appointmentId || state.phone!
         const toolResultStr = await cancelAppointmentTool.invoke({
            appointmentIdOrPhone: identifier,
         })
         const toolResult = JSON.parse(toolResultStr)
         if (!toolResult.success) {
            return {
               requiresConfirmation: false,
               error: toolResult.error,
               finalResponse: `Failed to cancel appointment: ${toolResult.error}`,
            }
         }
         const record = toolResult.appointment

         return {
            requiresConfirmation: false,
            confirmationType: undefined,
            appointmentId: record.id,
            toolResult: record,
            finalResponse: `❌ **Appointment Cancelled**\n\nYour appointment \`${record.id}\` with ${record.doctorName} on ${record.date} at ${record.time} has been successfully cancelled and removed from Google Calendar.`,
         }
      }
   } catch (err: any) {
      console.error('Error executing tool node:', err)
      return {
         error: err.message,
         finalResponse: `Tool execution error: ${err.message}`,
      }
   }

   return {}
}
