export const productSchema = {
   request: {
      querystring: {
         type: 'object',
         properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
         },
         required: [],
      },
   },
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
            pagination: {
               type: 'object',
               properties: {
                  page: { type: 'number' },
                  totalPages: { type: 'number' },
                  total: { type: 'number' },
                  hasPrevPage: { type: 'boolean' },
                  hasNextPage: { type: 'boolean' },
               },
               required: ['page', 'totalPages', 'total', 'hasPrevPage', 'hasNextPage'],
            },
         },
         required: ['data', 'pagination'],
      },
   },
}
