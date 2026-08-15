import { checkSlotAvailabilityTool } from './check-availability.tool'
import { createAppointmentTool } from './create-appointment.tool'
import { rescheduleAppointmentTool } from './reschedule.tool'
import { cancelAppointmentTool } from './cancel.tool'

export { checkSlotAvailabilityTool, createAppointmentTool, rescheduleAppointmentTool, cancelAppointmentTool }

export const clinicTools = [
   checkSlotAvailabilityTool,
   createAppointmentTool,
   rescheduleAppointmentTool,
   cancelAppointmentTool,
]
