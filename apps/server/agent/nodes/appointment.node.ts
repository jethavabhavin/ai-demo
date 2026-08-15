import type { ClinicAgentStateType } from '../state'
import { appointmentRepository } from '../../appointments/appointment.repository'

export async function appointmentNode(state: ClinicAgentStateType): Promise<Partial<ClinicAgentStateType>> {
   const intent = state.intent
   const query = (state.userQuery || '').trim().toLowerCase()

   const isUserConfirming =
      query === 'yes' ||
      query === 'confirm' ||
      query === 'yes confirm' ||
      query === 'proceed' ||
      query.includes('confirm appointment') ||
      query.includes('yes please')

   const isUserDeclining = query === 'no' || query === 'cancel' || query === 'abort' || query.includes('no thanks')

   if (isUserDeclining && state.requiresConfirmation) {
      return {
         requiresConfirmation: false,
         confirmationType: undefined,
         finalResponse: 'Appointment action cancelled. Is there anything else I can help you with?',
      }
   }

   const doctorName = state.doctorName
   const department = state.department
   const requestedDate = state.requestedDate
   const preferredTime = state.preferredTime || state.selectedSlot

   const patientName = state.patientName
   const phone = state.phone
   const email = state.email

   // 1. CHECK AVAILABILITY
   if (intent === 'CHECK_AVAILABILITY') {
      if (!doctorName && !department) {
         return {
            finalResponse:
               'Which doctor or department would you like to check availability for? (e.g., Dr. Patel, Cardiology, Dr. Sarah Jenkins, Pediatrics)',
         }
      }
      if (!requestedDate) {
         return {
            finalResponse: 'What date would you like to check availability for? (e.g., Today, Tomorrow, or YYYY-MM-DD)',
         }
      }
      return {
         doctorName,
         department,
         requestedDate,
         preferredTime,
      }
   }

   // 2. BOOK APPOINTMENT
   if (intent === 'BOOK_APPOINTMENT') {
      const targetDoctor = doctorName || department

      if (!targetDoctor) {
         return {
            finalResponse:
               'Which doctor or department would you like to book an appointment with? (e.g., Dr. Patel, Cardiology, Dr. Sarah Jenkins, Pediatrics)',
         }
      }
      if (!requestedDate) {
         return {
            finalResponse: `What date would you like to book your appointment with **${targetDoctor}**? (e.g., Today, Tomorrow, or YYYY-MM-DD)`,
         }
      }
      if (!preferredTime) {
         return {
            finalResponse: `What time would you prefer for your appointment on **${requestedDate}**? (e.g., 10:00 AM, 02:30 PM)`,
         }
      }

      // Check for missing patient info
      const missingPatientFields: string[] = []
      if (!patientName) missingPatientFields.push('Full Name')
      if (!phone) missingPatientFields.push('Phone Number')
      if (!email) missingPatientFields.push('Email Address')

      if (missingPatientFields.length > 0) {
         return {
            doctorName,
            department,
            requestedDate,
            preferredTime,
            finalResponse: `To complete your booking with **${targetDoctor}** on **${requestedDate}** at **${preferredTime}**, please provide your:\n\n${missingPatientFields
               .map((f) => `• **${f}**`)
               .join('\n')}`,
         }
      }

      // Step A: If user confirmed or confirming now
      if (isUserConfirming) {
         return {
            requiresConfirmation: false,
            confirmationType: undefined,
         }
      }

      // Step B: Ask for confirmation first
      if (!state.requiresConfirmation) {
         return {
            doctorName,
            department,
            requestedDate,
            preferredTime,
            selectedSlot: preferredTime,
            patientName,
            phone,
            email,
            requiresConfirmation: true,
            confirmationType: 'BOOK',
            finalResponse: `Please confirm your appointment details:\n\n- **Doctor/Dept**: ${targetDoctor}\n- **Date**: ${requestedDate}\n- **Time**: ${preferredTime}\n- **Patient Name**: ${patientName}\n- **Phone**: ${phone}\n- **Email**: ${email}\n\nWould you like me to confirm this appointment?`,
         }
      }
   }

   // 3. RESCHEDULE APPOINTMENT
   if (intent === 'RESCHEDULE_APPOINTMENT') {
      const identifier = state.appointmentId || state.phone

      if (!identifier) {
         return {
            finalResponse:
               'Please provide your **Appointment ID** (e.g., APT-123456) or your **registered phone number** to find your appointment.',
         }
      }
      if (!requestedDate) {
         return {
            finalResponse:
               'What new date would you like to reschedule your appointment to? (e.g., Tomorrow, or YYYY-MM-DD)',
         }
      }
      if (!preferredTime) {
         return {
            finalResponse: `What new time would you like for your appointment on **${requestedDate}**? (e.g., 11:00 AM, 03:00 PM)`,
         }
      }

      if (isUserConfirming) {
         return {
            requiresConfirmation: false,
            confirmationType: undefined,
         }
      }

      if (!state.requiresConfirmation) {
         const existing = await appointmentRepository.findByIdOrPhone(identifier)
         if (!existing) {
            return {
               finalResponse: `I couldn't find an active appointment matching \`${identifier}\`. Please check your Appointment ID or registered phone number.`,
            }
         }

         return {
            appointmentId: existing.id,
            requestedDate,
            preferredTime,
            requiresConfirmation: true,
            confirmationType: 'RESCHEDULE',
            finalResponse: `Please confirm rescheduling your appointment:\n\n- **Appointment ID**: \`${existing.id}\`\n- **Doctor**: ${existing.doctorName}\n- **Current Schedule**: ${existing.date} at ${existing.time}\n- **Proposed New Date**: ${requestedDate}\n- **Proposed New Time**: ${preferredTime}\n\nWould you like me to confirm this reschedule?`,
         }
      }
   }

   // 4. CANCEL APPOINTMENT
   if (intent === 'CANCEL_APPOINTMENT') {
      const identifier = state.appointmentId || state.phone

      if (!identifier) {
         return {
            finalResponse:
               'Please provide your **Appointment ID** (e.g., APT-123456) or **registered phone number** to cancel your appointment.',
         }
      }

      if (isUserConfirming) {
         return {
            requiresConfirmation: false,
            confirmationType: undefined,
         }
      }

      if (!state.requiresConfirmation) {
         const existing = await appointmentRepository.findByIdOrPhone(identifier)
         if (!existing) {
            return {
               finalResponse: `I couldn't find an active appointment matching \`${identifier}\` to cancel. Please verify your Appointment ID or registered phone number.`,
            }
         }

         return {
            appointmentId: existing.id,
            requiresConfirmation: true,
            confirmationType: 'CANCEL',
            finalResponse: `⚠️ **Cancellation Confirmation Required**\n\nAre you sure you want to cancel your appointment:\n- **ID**: \`${existing.id}\`\n- **Patient**: ${existing.patientName}\n- **Doctor**: ${existing.doctorName}\n- **Date**: ${existing.date}\n- **Time**: ${existing.time}\n\nThis action will remove the event from Google Calendar. Type **Confirm** to proceed.`,
         }
      }
   }

   return {}
}
