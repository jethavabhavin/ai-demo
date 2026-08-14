import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { appointmentService } from '../../appointments/appointment.service'

export const checkSlotAvailabilityTool = tool(
   async ({ doctorName, date, preferredTime }) => {
      try {
         const slots = await appointmentService.getAvailableSlots(doctorName, date, preferredTime)
         return JSON.stringify({
            available: slots.length > 0,
            slots,
            doctorName,
            date,
         })
      } catch (err: any) {
         return JSON.stringify({
            available: false,
            error: err.message,
            slots: [],
         })
      }
   },
   {
      name: 'checkSlotAvailability',
      description:
         'Check available appointment time slots for a given doctor/specialty and date. Returns up to 3 slots.',
      schema: z.object({
         doctorName: z.string().optional().describe('Doctor name or specialty'),
         specialty: z.string().optional().describe('Clinic specialty or department'),
         date: z.string().describe('Target date in YYYY-MM-DD format'),
         preferredTime: z.string().optional().describe('Preferred time e.g. "11:00 AM"'),
      }),
   },
)
