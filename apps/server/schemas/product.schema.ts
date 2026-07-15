export const productSchema = {
   response: {
      200: {
         type: 'object',
         properties: {
            data: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     id: { type: 'number' },
                     name: { type: 'string' },
                     status: { type: 'boolean' },
                     price: { type: 'number' },
                  },
                  required: ['name', 'status', 'price'],
               },
            },
         },
      },
   },
}
