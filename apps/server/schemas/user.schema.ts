export const userSchema = {
   tags: ['user'],
   description: 'User related APIs  ',
   body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
         email: {
            type: 'string',
            format: 'email',
         },
         password: {
            type: 'string',
         },
      },
   },
   response: {
      200: {
         type: 'object',
         properties: {
            token: { type: 'string' },
            id: { type: 'string' },
            message: { type: 'string' },
         },
      },
   },
}
