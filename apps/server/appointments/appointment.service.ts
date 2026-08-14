import { appointmentRepository, type AppointmentRecord } from './appointment.repository'
import { googleCalendarService } from '../google-calendar/google-calendar.service'

export interface ValidateDateResult {
   valid: boolean
   reason?: string
}

export class AppointmentService {
   /**
    * Strict backend date and time validation
    */
   validateDateAndTime(dateStr: string, timeStr?: string): ValidateDateResult {
      const now = new Date()
      // Current date at midnight for strict date comparison
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      // Parse requested date (YYYY-MM-DD)
      const parts = dateStr.split('-').map(Number)
      const [year, month, day] = parts
      if (
         parts.length !== 3 ||
         year === undefined ||
         month === undefined ||
         day === undefined ||
         isNaN(year) ||
         isNaN(month) ||
         isNaN(day)
      ) {
         return { valid: false, reason: 'Invalid date format. Please use YYYY-MM-DD format.' }
      }

      const reqDate = new Date(year, month - 1, day)

      if (reqDate < todayMidnight) {
         return {
            valid: false,
            reason: 'Cannot schedule or check appointments in the past. Please select a future date.',
         }
      }

      const isToday = reqDate.getTime() === todayMidnight.getTime()

      if (isToday && timeStr) {
         const timeParsed = this.parseTimeStringToMinutes(timeStr)
         if (timeParsed !== null) {
            const currentMinutes = now.getHours() * 60 + now.getMinutes()
            if (timeParsed <= currentMinutes) {
               return {
                  valid: false,
                  reason: 'The requested time has already passed today. Please select a future time.',
               }
            }
         }
      }

      return { valid: true }
   }

   /**
    * Converts "11:00 AM", "2:30 PM", "14:00" to minutes from midnight
    */
   private parseTimeStringToMinutes(timeStr: string): number | null {
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
      if (!match || !match[1] || !match[2]) return null

      let hours = parseInt(match[1], 10)
      const minutes = parseInt(match[2], 10)
      const modifier = match[3]?.toUpperCase()

      if (modifier === 'PM' && hours < 12) hours += 12
      if (modifier === 'AM' && hours === 12) hours = 0

      return hours * 60 + minutes
   }

   /**
    * Calculates available 30-min slots during clinic working hours (09:00 AM - 05:00 PM)
    */
   async getAvailableSlots(doctorName?: string, dateStr?: string, preferredTime?: string): Promise<string[]> {
      const targetDate = dateStr || new Date(Date.now() + 86400000).toISOString().slice(0, 10)
      const val = this.validateDateAndTime(targetDate, preferredTime)
      if (!val.valid) {
         throw new Error(val.reason)
      }

      const busy = await googleCalendarService.getBusySlots(targetDate, doctorName)

      // Define standard clinic slots between 9 AM and 5 PM
      const candidateSlots = [
         '09:00 AM',
         '09:30 AM',
         '10:00 AM',
         '10:30 AM',
         '11:00 AM',
         '11:30 AM',
         '01:00 PM',
         '01:30 PM',
         '02:00 PM',
         '02:30 PM',
         '03:00 PM',
         '03:30 PM',
         '04:00 PM',
         '04:30 PM',
      ]

      const now = new Date()
      const isToday = targetDate === now.toISOString().slice(0, 10)
      const currentMins = now.getHours() * 60 + now.getMinutes()

      const freeSlots: string[] = []

      for (const slot of candidateSlots) {
         const slotMins = this.parseTimeStringToMinutes(slot)
         if (slotMins === null) continue

         // Skip past slots for today
         if (isToday && slotMins <= currentMins) continue

         // Convert slot to Date range
         const slotStartIso = `${targetDate}T${this.formatMinutesTo24h(slotMins)}:00Z`
         const slotEndIso = `${targetDate}T${this.formatMinutesTo24h(slotMins + 30)}:00Z`

         let isBusy = false
         for (const b of busy) {
            const busyStart = new Date(b.start).getTime()
            const busyEnd = new Date(b.end).getTime()
            const sStart = new Date(slotStartIso).getTime()
            const sEnd = new Date(slotEndIso).getTime()

            // Overlap check
            if (sStart < busyEnd && sEnd > busyStart) {
               isBusy = true
               break
            }
         }

         if (!isBusy) {
            freeSlots.push(slot)
         }
      }

      // If user provided preferred time, sort slots by closeness to preferred time
      if (preferredTime) {
         const prefMins = this.parseTimeStringToMinutes(preferredTime)
         if (prefMins !== null) {
            freeSlots.sort((a, b) => {
               const mA = this.parseTimeStringToMinutes(a) || 0
               const mB = this.parseTimeStringToMinutes(b) || 0
               return Math.abs(mA - prefMins) - Math.abs(mB - prefMins)
            })
         }
      }

      // Requirement: Return maximum 3 suitable slots
      return freeSlots.slice(0, 3)
   }

   private formatMinutesTo24h(totalMins: number): string {
      const h = Math.floor(totalMins / 60)
         .toString()
         .padStart(2, '0')
      const m = (totalMins % 60).toString().padStart(2, '0')
      return `${h}:${m}`
   }

   /**
    * Create appointment record & Google Calendar event
    */
   async createAppointment(params: {
      patientName: string
      phone: string
      email: string
      doctorName: string
      department: string
      date: string
      time: string
   }): Promise<AppointmentRecord> {
      const val = this.validateDateAndTime(params.date, params.time)
      if (!val.valid) {
         throw new Error(val.reason)
      }

      const id = `APT-${Date.now().toString().slice(-6)}`
      const slotMins = this.parseTimeStringToMinutes(params.time) || 540
      const startIso = `${params.date}T${this.formatMinutesTo24h(slotMins)}:00Z`
      const endIso = `${params.date}T${this.formatMinutesTo24h(slotMins + 30)}:00Z`

      // 1. Create Google Calendar Event
      const gcal = await googleCalendarService.createEvent({
         summary: `Clinic Appointment: ${params.patientName} with ${params.doctorName}`,
         description: `Department: ${params.department}\nPatient Phone: ${params.phone}\nPatient Email: ${params.email}\nAppointment ID: ${id}`,
         startIso,
         endIso,
         patientEmail: params.email,
      })

      // 2. Save in database repository
      const record = await appointmentRepository.create({
         id,
         patientName: params.patientName,
         phone: params.phone,
         email: params.email,
         doctorName: params.doctorName,
         specialty: params.department,
         department: params.department,
         date: params.date,
         time: params.time,
         googleCalendarEventId: gcal.id,
         status: 'CONFIRMED',
      })

      return record
   }

   /**
    * Reschedule appointment
    */
   async rescheduleAppointment(identifier: string, newDate: string, newTime: string): Promise<AppointmentRecord> {
      const existing = await appointmentRepository.findByIdOrPhone(identifier)
      if (!existing) {
         throw new Error(`No active appointment found for ID or Phone: ${identifier}`)
      }

      const val = this.validateDateAndTime(newDate, newTime)
      if (!val.valid) {
         throw new Error(val.reason)
      }

      const slotMins = this.parseTimeStringToMinutes(newTime) || 540
      const startIso = `${newDate}T${this.formatMinutesTo24h(slotMins)}:00Z`
      const endIso = `${newDate}T${this.formatMinutesTo24h(slotMins + 30)}:00Z`

      if (existing.googleCalendarEventId) {
         await googleCalendarService.updateEvent(existing.googleCalendarEventId, {
            summary: `Rescheduled Clinic Appointment: ${existing.patientName} with ${existing.doctorName}`,
            description: `Department: ${existing.department}\nPatient Phone: ${existing.phone}\nAppointment ID: ${existing.id}`,
            startIso,
            endIso,
         })
      }

      const updated = await appointmentRepository.update(existing.id, {
         date: newDate,
         time: newTime,
         status: 'RESCHEDULED',
      })

      return updated!
   }

   /**
    * Cancel appointment
    */
   async cancelAppointment(identifier: string): Promise<AppointmentRecord> {
      const existing = await appointmentRepository.findByIdOrPhone(identifier)
      if (!existing) {
         throw new Error(`No active appointment found for ID or Phone: ${identifier}`)
      }

      if (existing.googleCalendarEventId) {
         await googleCalendarService.deleteEvent(existing.googleCalendarEventId)
      }

      const updated = await appointmentRepository.update(existing.id, {
         status: 'CANCELLED',
      })

      return updated!
   }
}

export const appointmentService = new AppointmentService()
export default appointmentService
