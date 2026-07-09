const conversation = new Map<string, string>()

export const conversationRepository = {
   setLastResponseId(convId: string, responseId: string) {
      conversation.set(convId, responseId)
   },
   getLastResponseId(convId: string) {
      return conversation.get(convId)
   },
}
