import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { appointmentService } from '../../appointments/appointment.service'

export const createAppointmentTool = tool(
   async ({ patientName, phone, email, doctorName, department, date, time }) => {
      try {
         const record = await appointmentService.createAppointment({
            patientName,
            phone,
            email,
            doctorName,
            department,
            date,
            time,
         })
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
      name: 'createAppointment',
      description: 'Create a confirmed clinic appointment and Google Calendar event after user confirmation.',
      schema: z.object({
         patientName: z.string().describe('Patient full name'),
         phone: z.string().describe('Patient phone number'),
         email: z.string().email().describe('Patient email address'),
         doctorName: z.string().describe('Doctor name'),
         department: z.string().describe('Medical department or specialty'),
         date: z.string().describe('Appointment date in YYYY-MM-DD format'),
         time: z.string().describe('Appointment time e.g. "11:00 AM"'),
      }),
   },
)
