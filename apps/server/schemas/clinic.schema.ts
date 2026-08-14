export const clinicChatStreamSchema = {
   tags: ['Clinic'],
   summary: 'Clinic AI Assistant SSE Stream Endpoint',
   body: {
      type: 'object',
      required: ['prompt'],
      properties: {
         prompt: { type: 'string', minLength: 1 },
         convId: { type: 'string' },
         sessionId: { type: 'string' },
      },
   },
}

export const clinicSlotsSchema = {
   tags: ['Clinic'],
   summary: 'Direct Slot Availability Check Endpoint',
   querystring: {
      type: 'object',
      properties: {
         doctorName: { type: 'string' },
         date: { type: 'string' },
         preferredTime: { type: 'string' },
      },
   },
   response: {
      200: {
         type: 'object',
         properties: {
            available: { type: 'boolean' },
            slots: {
               type: 'array',
               items: { type: 'string' },
            },
            doctorName: { type: 'string' },
            date: { type: 'string' },
         },
      },
      400: {
         type: 'object',
         properties: {
            error: { type: 'string' },
            slots: {
               type: 'array',
               items: { type: 'string' },
            },
         },
      },
   },
}

export const clinicEvalSchema = {
   tags: ['Clinic'],
   summary: 'LangSmith Agent Evaluation Endpoint',
   response: {
      200: {
         type: 'object',
         additionalProperties: true,
      },
      500: {
         type: 'object',
         properties: {
            error: { type: 'string' },
         },
      },
   },
}

export const clinicMetricsSchema = {
   tags: ['Clinic'],
   summary: 'Monitoring & Agent Performance Metrics Endpoint',
   response: {
      200: {
         type: 'object',
         properties: {
            status: { type: 'string' },
            agentFramework: { type: 'string' },
            tracingProvider: { type: 'string' },
            calendarService: { type: 'string' },
            database: { type: 'string' },
            uptime: { type: 'number' },
            timestamp: { type: 'string' },
         },
      },
   },
}
