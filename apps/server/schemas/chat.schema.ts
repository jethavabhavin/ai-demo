export const chatSchema = {
   body: {
      type: 'object',
      required: ['prompt', 'convId'],
      properties: {
         prompt: {
            type: 'string',
            minLength: 1,
            maxLength: 1000,
         },
         convId: {
            type: 'string',
            format: 'uuid',
         },
      },
   },
   response: {
      200: {
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
      },
   },
}
