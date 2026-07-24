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
            message: {
               type: 'object',
               properties: {
                  id: { type: 'string' },
                  message: { type: 'string' },
                  references: {
                     type: 'array',
                     items: {
                        type: 'object',
                        properties: {
                           name: { type: 'string' },
                           url: { type: 'string' },
                        },
                     },
                  },
               },
            },
         },
      },
   },
}

export const uploadPdfRagSchema = {
   body: {
      type: 'object',
      additionalProperties: true,
   },
   response: {
      200: {
         type: 'object',
         properties: {
            message: { type: 'string' },
            success: { type: 'boolean' },
         },
      },
   },
}

export const getUserPdfsSchema = {
   response: {
      200: {
         type: 'object',
         properties: {
            pdfs: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     _id: { type: 'string' },
                     userId: { type: 'string' },
                     originalName: { type: 'string' },
                     filename: { type: 'string' },
                     path: { type: 'string' },
                     size: { type: 'number' },
                     status: { type: 'string' },
                     url: { type: 'string' },
                     createdAt: { type: 'string' },
                  },
               },
            },
         },
      },
   },
}

export const deleteUserPdfSchema = {
   params: {
      type: 'object',
      required: ['id'],
      properties: {
         id: { type: 'string' },
      },
   },
   response: {
      200: {
         type: 'object',
         properties: {
            message: { type: 'string' },
            success: { type: 'boolean' },
         },
      },
   },
}
