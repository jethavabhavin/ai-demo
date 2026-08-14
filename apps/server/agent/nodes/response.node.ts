import type { ClinicAgentStateType, Message } from '../state'

export async function responseNode(state: ClinicAgentStateType): Promise<Partial<ClinicAgentStateType>> {
   const responseText = state.finalResponse || 'Thank you for contacting Apex Health Clinic.'

   const updatedMessages: Message[] = [
      ...(state.messages || []),
      {
         role: 'assistant',
         content: responseText,
      },
   ]

   return {
      messages: updatedMessages,
      finalResponse: responseText,
   }
}
