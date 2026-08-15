import { google } from 'googleapis'

export interface CalendarEvent {
   id: string
   summary: string
   description: string
   start: { dateTime: string }
   end: { dateTime: string }
   attendees?: Array<{ email: string }>
}

export interface BusySlot {
   start: string // ISO string
   end: string // ISO string
}

class GoogleCalendarService {
   private calendar: any = null
   private calendarId: string = process.env.GOOGLE_CALENDAR_ID || 'primary'
   private isRealGoogleCalendar: boolean = false
   private mockEvents: Map<string, CalendarEvent> = new Map()

   constructor() {
      const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

      if (clientEmail && privateKey) {
         try {
            const auth = new google.auth.JWT({
               email: clientEmail,
               key: privateKey,
               scopes: ['https://www.googleapis.com/auth/calendar'],
            })
            this.calendar = google.calendar({ version: 'v3', auth })
            this.isRealGoogleCalendar = true
            console.log('✅ Google Calendar API configured successfully.')
         } catch (err) {
            console.warn(
               '⚠️ Google Calendar credentials failed to initialize, falling back to mock calendar store.',
               err,
            )
            this.isRealGoogleCalendar = false
         }
      } else {
         console.log('ℹ️ Google Calendar credentials omitted. Operating with local Google Calendar service mock.')
      }

      // Seed initial mock busy slots for realistic slot availability testing
      this.seedInitialMockEvents()
   }

   private seedInitialMockEvents() {
      // Seed busy slots for today and future days
      const todayStr = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const sampleEvents: CalendarEvent[] = [
         {
            id: 'evt_sample_1',
            summary: 'Dr. Patel - Patient Appointment',
            description: 'Routine Cardiology Checkup',
            start: { dateTime: `${todayStr}T09:00:00Z` },
            end: { dateTime: `${todayStr}T09:30:00Z` },
         },
         {
            id: 'evt_sample_2',
            summary: 'Dr. Patel - Surgery Prep',
            description: 'Medical Procedure',
            start: { dateTime: `${todayStr}T14:00:00Z` },
            end: { dateTime: `${todayStr}T15:00:00Z` },
         },
         {
            id: 'evt_sample_3',
            summary: 'Dr. Patel - Executive Meeting',
            description: 'Department Review',
            start: { dateTime: `${tomorrowStr}T10:00:00Z` },
            end: { dateTime: `${tomorrowStr}T10:30:00Z` },
         },
         {
            id: 'evt_sample_4',
            summary: 'Dr. Sarah Jenkins - Pediatric Rounds',
            description: 'Pediatric Patient Care',
            start: { dateTime: `${tomorrowStr}T13:00:00Z` },
            end: { dateTime: `${tomorrowStr}T14:00:00Z` },
         },
      ]

      for (const evt of sampleEvents) {
         this.mockEvents.set(evt.id, evt)
      }
   }

   /**
    * Retrieve busy slots for a target date (YYYY-MM-DD)
    */
   async getBusySlots(dateStr: string, doctorName?: string): Promise<BusySlot[]> {
      const timeMin = new Date(`${dateStr}T00:00:00Z`).toISOString()
      const timeMax = new Date(`${dateStr}T23:59:59Z`).toISOString()

      if (this.isRealGoogleCalendar && this.calendar) {
         try {
            const res = await this.calendar.freebusy.query({
               requestBody: {
                  timeMin,
                  timeMax,
                  items: [{ id: this.calendarId }],
               },
            })
            const busyList = res.data.calendars?.[this.calendarId]?.busy || []
            return busyList.map((b: any) => ({ start: b.start, end: b.end }))
         } catch (err) {
            console.error('Error fetching Google Calendar busy slots, using mock fallback:', err)
         }
      }

      // Mock Calendar Fallback
      const busySlots: BusySlot[] = []
      const targetDate = dateStr.slice(0, 10)

      for (const evt of this.mockEvents.values()) {
         const evtStartDate = evt.start.dateTime.slice(0, 10)
         if (evtStartDate === targetDate) {
            if (!doctorName || evt.summary.toLowerCase().includes(doctorName.toLowerCase())) {
               busySlots.push({
                  start: evt.start.dateTime,
                  end: evt.end.dateTime,
               })
            }
         }
      }

      return busySlots
   }

   /**
    * Create a new Google Calendar Event
    */
   async createEvent(params: {
      summary: string
      description: string
      startIso: string
      endIso: string
      patientEmail?: string
   }): Promise<{ id: string; htmlLink?: string }> {
      if (this.isRealGoogleCalendar && this.calendar) {
         try {
            const eventPayload: any = {
               summary: params.summary,
               description: params.description,
               start: { dateTime: params.startIso },
               end: { dateTime: params.endIso },
            }
            if (params.patientEmail) {
               eventPayload.attendees = [{ email: params.patientEmail }]
            }

            const response = await this.calendar.events.insert({
               calendarId: this.calendarId,
               requestBody: eventPayload,
            })

            return {
               id: response.data.id,
               htmlLink: response.data.htmlLink,
            }
         } catch (err) {
            console.error('Error creating Google Calendar event via API, falling back to mock store:', err)
         }
      }

      const id = `gcal_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const newEvt: CalendarEvent = {
         id,
         summary: params.summary,
         description: params.description,
         start: { dateTime: params.startIso },
         end: { dateTime: params.endIso },
         attendees: params.patientEmail ? [{ email: params.patientEmail }] : [],
      }

      this.mockEvents.set(id, newEvt)
      return { id, htmlLink: `https://calendar.google.com/calendar/event?eid=${id}` }
   }

   /**
    * Update existing Google Calendar event
    */
   async updateEvent(
      eventId: string,
      params: {
         summary?: string
         description?: string
         startIso: string
         endIso: string
      },
   ): Promise<{ id: string }> {
      if (this.isRealGoogleCalendar && this.calendar) {
         try {
            await this.calendar.events.patch({
               calendarId: this.calendarId,
               eventId: eventId,
               requestBody: {
                  summary: params.summary,
                  description: params.description,
                  start: { dateTime: params.startIso },
                  end: { dateTime: params.endIso },
               },
            })
            return { id: eventId }
         } catch (err) {
            console.error('Error updating Google Calendar event API, using fallback store:', err)
         }
      }

      const existing = this.mockEvents.get(eventId)
      if (existing) {
         if (params.summary) existing.summary = params.summary
         if (params.description) existing.description = params.description
         existing.start = { dateTime: params.startIso }
         existing.end = { dateTime: params.endIso }
         this.mockEvents.set(eventId, existing)
      }
      return { id: eventId }
   }

   /**
    * Delete Google Calendar Event
    */
   async deleteEvent(eventId: string): Promise<boolean> {
      if (this.isRealGoogleCalendar && this.calendar) {
         try {
            await this.calendar.events.delete({
               calendarId: this.calendarId,
               eventId: eventId,
            })
            return true
         } catch (err) {
            console.error('Error deleting Google Calendar event API:', err)
         }
      }

      this.mockEvents.delete(eventId)
      return true
   }

   /**
    * Get Event Details
    */
   async getEvent(eventId: string): Promise<CalendarEvent | null> {
      if (this.isRealGoogleCalendar && this.calendar) {
         try {
            const res = await this.calendar.events.get({
               calendarId: this.calendarId,
               eventId: eventId,
            })
            return {
               id: res.data.id,
               summary: res.data.summary,
               description: res.data.description,
               start: { dateTime: res.data.start.dateTime },
               end: { dateTime: res.data.end.dateTime },
            }
         } catch (err) {
            console.error('Error fetching Google Calendar event API:', err)
         }
      }

      return this.mockEvents.get(eventId) || null
   }
}

export const googleCalendarService = new GoogleCalendarService()
export default googleCalendarService
