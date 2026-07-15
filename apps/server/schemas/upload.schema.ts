export const uploadSchema = {
   body: {
      type: 'object',
      required: ['image'],
      properties: {
         image: { type: 'string' },
      },
   },
   response: {
      200: {
         type: 'object',
         properties: {
            stats: { type: 'object', additionalProperties: true },
         },
      },
   },
}
