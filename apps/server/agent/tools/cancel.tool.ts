import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { appointmentService } from '../../appointments/appointment.service'

export const cancelAppointmentTool = tool(
   async ({ appointmentIdOrPhone }) => {
      try {
         const record = await appointmentService.cancelAppointment(appointmentIdOrPhone)
         return JSON.stringify({
            success: true,
            appointment: record,
         })
      } catch (err: any) {
         return JSON.stringify({
            success: false,
            error: err.message,
         })
      }
   },
   {
      name: 'cancelAppointment',
      description: 'Cancel an existing appointment and remove Google Calendar event after user confirmation.',
      schema: z.object({
         appointmentIdOrPhone: z.string().describe('Appointment ID (e.g. APT-1001) or registered phone number'),
      }),
   },
)
