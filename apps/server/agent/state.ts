import { Annotation } from '@langchain/langgraph'

export interface Message {
   role: 'user' | 'assistant' | 'system'
   content: string
}

export type IntentType =
   | 'CLINIC_INFO'
   | 'CHECK_AVAILABILITY'
   | 'BOOK_APPOINTMENT'
   | 'RESCHEDULE_APPOINTMENT'
   | 'CANCEL_APPOINTMENT'
   | 'OUT_OF_SCOPE'
   | 'MEDICAL_ADVICE'

export interface ClinicAgentState {
   messages: Message[]
   userQuery: string
   intent?: IntentType

   patientName?: string
   phone?: string
   email?: string

   doctorName?: string
   specialty?: string
   department?: string

   appointmentId?: string

   requestedDate?: string
   preferredTime?: string
   selectedSlot?: string

   availableSlots?: string[]

   retrievedDocuments?: Array<{ pageContent: string; metadata: Record<string, any> }>

   toolResult?: unknown

   requiresConfirmation?: boolean
   confirmationType?: 'BOOK' | 'RESCHEDULE' | 'CANCEL'

   error?: string
   finalResponse?: string
   sessionId?: string
}

export const ClinicAgentAnnotation = Annotation.Root({
   messages: Annotation<Message[]>({
      reducer: (x, y) => (y ? x.concat(y) : x),
      default: () => [],
   }),
   userQuery: Annotation<string>({
      reducer: (x, y) => y ?? x,
      default: () => '',
   }),
   intent: Annotation<IntentType | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   patientName: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   phone: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   email: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   doctorName: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   specialty: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   department: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   appointmentId: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   requestedDate: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   preferredTime: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   selectedSlot: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   availableSlots: Annotation<string[] | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   retrievedDocuments: Annotation<Array<{ pageContent: string; metadata: Record<string, any> }> | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   toolResult: Annotation<unknown>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   requiresConfirmation: Annotation<boolean | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   confirmationType: Annotation<'BOOK' | 'RESCHEDULE' | 'CANCEL' | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   error: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   finalResponse: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
   sessionId: Annotation<string | undefined>({
      reducer: (x, y) => y ?? x,
      default: () => undefined,
   }),
})

export type ClinicAgentStateType = typeof ClinicAgentAnnotation.State
