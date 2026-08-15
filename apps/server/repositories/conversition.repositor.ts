const conversation = new Map<string, string>()

export class ConversationRepository {
   setLastResponseId(convId: string, responseId: string) {
      conversation.set(convId, responseId)
   }
   getLastResponseId(convId: string) {
      return conversation.get(convId)
   }
}

export const conversationRepository = new ConversationRepository()
export default conversationRepository
