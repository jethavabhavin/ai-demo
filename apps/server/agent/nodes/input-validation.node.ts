import type { ClinicAgentStateType } from '../state'

export async function inputValidationNode(state: ClinicAgentStateType): Promise<Partial<ClinicAgentStateType>> {
   const rawQuery =
      state.userQuery ||
      (state.messages && state.messages.length > 0 ? state.messages[state.messages.length - 1]?.content : '')
   const sanitizedQuery = (rawQuery || '').trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')

   if (!sanitizedQuery) {
      return {
         userQuery: '',
         error: 'Empty or invalid message received.',
         finalResponse: 'Please provide a valid question or request regarding our clinic.',
      }
   }

   const sessionId = state.sessionId || `session_${Date.now()}`

   return {
      userQuery: sanitizedQuery,
      sessionId,
      error: undefined,
   }
}
