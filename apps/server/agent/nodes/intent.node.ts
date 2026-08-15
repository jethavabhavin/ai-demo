import type { ClinicAgentStateType, IntentType } from '../state'
import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { doctorRepository } from '../../repositories/doctor.repository'

export async function intentDetectionNode(state: ClinicAgentStateType): Promise<Partial<ClinicAgentStateType>> {
   // If intent was already finalized by Guardrail node, retain it
   if (state.intent === 'OUT_OF_SCOPE' || state.intent === 'MEDICAL_ADVICE') {
      return {}
   }

   const query = state.userQuery || ''
   const qLower = query.toLowerCase()

   let classifiedIntent: IntentType | null = null

   // If intent is already active (e.g. user answering follow-up details for booking/rescheduling), retain active intent
   if (
      state.intent &&
      (state.requiresConfirmation || state.requestedDate || state.preferredTime || state.appointmentId)
   ) {
      classifiedIntent = state.intent
   }

   // LLM Intent Classification
   if (!classifiedIntent && query.trim()) {
      try {
         const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
         if (apiKey) {
            let llm: any
            if (process.env.OPENAI_API_KEY) {
               llm = new ChatOpenAI({ modelName: 'gpt-4o-mini', temperature: 0, maxTokens: 20 })
            } else {
               llm = new ChatGoogleGenerativeAI({ model: 'gemini-1.5-flash', temperature: 0, maxOutputTokens: 20 })
            }

            const prompt = `Classify the user's clinic query into exactly ONE of these categories:
- CLINIC_INFO: general questions about clinic hours, services, doctors, location, fees, or greetings.
- CHECK_AVAILABILITY: asking about available doctor time slots or free appointments.
- BOOK_APPOINTMENT: requesting to schedule, book, or reserve a doctor appointment.
- RESCHEDULE_APPOINTMENT: asking to change, postpone, or move an existing appointment.
- CANCEL_APPOINTMENT: requesting to cancel, remove, or delete an appointment.
- MEDICAL_ADVICE: asking for medical diagnosis, treatment, or drug prescriptions.
- OUT_OF_SCOPE: completely unrelated to clinic services.

Query: "${query}"
Category:`

            const res = await llm.invoke(prompt)
            const content = (typeof res.content === 'string' ? res.content : String(res.content)).trim().toUpperCase()

            const validIntents: IntentType[] = [
               'CLINIC_INFO',
               'CHECK_AVAILABILITY',
               'BOOK_APPOINTMENT',
               'RESCHEDULE_APPOINTMENT',
               'CANCEL_APPOINTMENT',
               'OUT_OF_SCOPE',
               'MEDICAL_ADVICE',
            ]

            const match = validIntents.find((i) => content.includes(i))
            if (match) classifiedIntent = match
         }
      } catch (err) {
         console.warn('LLM Intent Classification notice:', err)
      }
   }

   // Extract entity context (Doctor name, date, appointment ID, patient details) from query
   const extractedEntities = await extractEntitiesFromQuery(query)

   return {
      intent: classifiedIntent || 'CLINIC_INFO',
      ...extractedEntities,
   }
}

async function extractEntitiesFromQuery(query: string) {
   const qLower = query.toLowerCase()
   const result: Record<string, any> = {}

   // Doctor extraction from DB repository
   const matchedDoctor = await doctorRepository.findDoctorByQuery(query)
   if (matchedDoctor) {
      result.doctorName = matchedDoctor.doctorName
      result.department = matchedDoctor.department
      result.specialty = matchedDoctor.specialty
   }

   // Date extraction
   const today = new Date()
   if (qLower.includes('today')) {
      result.requestedDate = today.toISOString().split('T')[0]
   } else if (qLower.includes('tomorrow')) {
      const tom = new Date(today.getTime() + 86400000)
      result.requestedDate = tom.toISOString().split('T')[0]
   } else {
      const dateMatch = query.match(/\b\d{4}-\d{2}-\d{2}\b/)
      if (dateMatch) {
         result.requestedDate = dateMatch[0]
      }
   }

   // Time extraction
   const timeMatch = query.match(/\b(\d{1,2}:\d{2}\s*(?:AM|PM)?|\d{1,2}\s*(?:AM|PM))\b/i)
   if (timeMatch) {
      result.preferredTime = timeMatch[0]
   }

   // Appointment ID extraction (APT-XXXXXX or APT-XXXX)
   const aptMatch = query.match(/\b(APT-\d+)\b/i)
   if (aptMatch && aptMatch[1]) {
      result.appointmentId = aptMatch[1].toUpperCase()
   }

   // Phone extraction
   const phoneMatch = query.match(/\b(\+?\d{10,14})\b/)
   if (phoneMatch) {
      result.phone = phoneMatch[1]
   }

   // Email extraction
   const emailMatch = query.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/)
   if (emailMatch) {
      result.email = emailMatch[0]
   }

   // Name extraction (e.g. "my name is Alex Johnson", "name: Alex", "I am Alex")
   const nameMatch = query.match(/(?:my name is|i am|name is|patient name:?)\s+([A-Za-z\s]+)/i)
   if (nameMatch && nameMatch[1]) {
      const nameCandidate = nameMatch[1].trim()
      const lower = nameCandidate.toLowerCase()
      if (!['yes', 'no', 'confirm', 'cancel', 'proceed', 'doctor', 'today', 'tomorrow'].includes(lower)) {
         result.patientName = nameCandidate
      }
   }

   return result
}
