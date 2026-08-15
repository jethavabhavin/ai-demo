import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { graphAgent } from '../agent/graph'
import { appointmentService } from '../appointments/appointment.service'
import { runAgentEvaluation } from '../langsmith/eval'
import {
   clinicChatStreamSchema,
   clinicSlotsSchema,
   clinicEvalSchema,
   clinicMetricsSchema,
} from '../schemas/clinic.schema'

class ClinicRouter {
   constructor(private fastify: FastifyInstance) {}

   public register(): void {
      // 1. Real-Time SSE Streaming Endpoint
      this.fastify.post(
         '/api/clinic/chat/stream',
         { schema: clinicChatStreamSchema },
         async (req: FastifyRequest, reply: FastifyReply) => {
            const { prompt, convId, sessionId } = req.body as { prompt: string; convId?: string; sessionId?: string }
            const effectiveSession = sessionId || convId || `session_${Date.now()}`

            if (!prompt || typeof prompt !== 'string') {
               return reply.status(400).send({ error: 'Valid message prompt is required.' })
            }

            // Configure Server-Sent Events (SSE) headers
            reply.raw.setHeader('Content-Type', 'text/event-stream')
            reply.raw.setHeader('Cache-Control', 'no-cache')
            reply.raw.setHeader('Connection', 'keep-alive')
            reply.raw.setHeader('Access-Control-Allow-Origin', '*')

            try {
               await graphAgent.runStream(
                  {
                     userQuery: prompt,
                     sessionId: effectiveSession,
                  },
                  (tokenChunk: string) => {
                     reply.raw.write(`data: ${JSON.stringify({ type: 'token', content: tokenChunk })}\n\n`)
                  },
                  (finalState) => {
                     reply.raw.write(
                        `data: ${JSON.stringify({
                           type: 'done',
                           metadata: {
                              intent: finalState.intent,
                              availableSlots: finalState.availableSlots,
                              requiresConfirmation: finalState.requiresConfirmation,
                              confirmationType: finalState.confirmationType,
                              doctorName: finalState.doctorName,
                              requestedDate: finalState.requestedDate,
                              preferredTime: finalState.preferredTime || finalState.selectedSlot,
                              appointmentId: finalState.appointmentId,
                              toolResult: finalState.toolResult,
                              sessionId: effectiveSession,
                           },
                        })}\n\n`,
                     )
                     reply.raw.end()
                  },
               )
            } catch (err: any) {
               console.error('SSE Stream Error:', err)
               reply.raw.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`)
               reply.raw.end()
            }
         },
      )

      // 2. Direct Slot Availability Check Endpoint
      this.fastify.get(
         '/api/clinic/slots',
         { schema: clinicSlotsSchema },
         async (req: FastifyRequest, reply: FastifyReply) => {
            const { doctorName, date, preferredTime } = req.query as {
               doctorName?: string
               date?: string
               preferredTime?: string
            }
            const targetDate = date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
            const effectiveDoctor = doctorName || 'Dr. Patel'

            try {
               const slots = await appointmentService.getAvailableSlots(effectiveDoctor, targetDate, preferredTime)
               return reply.send({
                  available: slots.length > 0,
                  slots,
                  doctorName: effectiveDoctor,
                  date: targetDate,
               })
            } catch (err: any) {
               return reply.status(400).send({ error: err.message, slots: [] })
            }
         },
      )

      // 3. LangSmith Agent Evaluation Endpoint
      this.fastify.post(
         '/api/clinic/eval',
         { schema: clinicEvalSchema },
         async (req: FastifyRequest, reply: FastifyReply) => {
            try {
               const evalResult = await runAgentEvaluation()
               return reply.send(evalResult)
            } catch (err: any) {
               return reply.status(500).send({ error: `Evaluation failed: ${err.message}` })
            }
         },
      )

      // 4. Monitoring & Agent Performance Metrics Endpoint
      this.fastify.get(
         '/api/clinic/metrics',
         { schema: clinicMetricsSchema },
         async (req: FastifyRequest, reply: FastifyReply) => {
            return reply.send({
               status: 'HEALTHY',
               agentFramework: 'LangGraph',
               tracingProvider: 'LangSmith',
               calendarService: 'Google Calendar API',
               database: process.env.MONGODB_URI
                  ? 'MongoDB (Collection: ClinicAppointment)'
                  : 'Local Persistent Storage',
               uptime: process.uptime(),
               timestamp: new Date().toISOString(),
            })
         },
      )
   }
}

export default async function clinicRouter(fastify: FastifyInstance) {
   new ClinicRouter(fastify).register()
}
