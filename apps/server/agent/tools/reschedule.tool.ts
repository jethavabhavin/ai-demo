import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { appointmentService } from '../../appointments/appointment.service'

export const rescheduleAppointmentTool = tool(
   async ({ appointmentIdOrPhone, newDate, newTime }) => {
      try {
         const record = await appointmentService.rescheduleAppointment(appointmentIdOrPhone, newDate, newTime)
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
      name: 'rescheduleAppointment',
      description: 'Reschedule an existing clinic appointment to a new date and time after user confirmation.',
      schema: z.object({
         appointmentIdOrPhone: z.string().describe('Appointment ID (e.g. APT-1001) or registered phone number'),
         newDate: z.string().describe('New appointment date in YYYY-MM-DD format'),
         newTime: z.string().describe('New appointment time e.g. "11:30 AM"'),
      }),
   },
)
