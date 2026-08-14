import { Client } from 'langsmith'

export interface TraceMetadata {
   clinicId?: string
   sessionId?: string
   intent?: string
   doctor?: string
   appointmentOperation?: string
   environment?: string
   [key: string]: any
}

class LangSmithTracingService {
   private client: Client | null = null
   private isTracingEnabled: boolean = false

   constructor() {
      const apiKey = process.env.LANGSMITH_API_KEY
      const isTracing = process.env.LANGSMITH_TRACING === 'true'

      if (apiKey && isTracing) {
         try {
            this.client = new Client({ apiKey })
            this.isTracingEnabled = true
            console.log(`✅ LangSmith Tracing enabled for project: ${process.env.LANGSMITH_PROJECT || 'clinic-agent'}`)
         } catch (err) {
            console.warn('⚠️ LangSmith initialization failed:', err)
         }
      } else {
         console.log('ℹ️ LangSmith API key or LANGSMITH_TRACING not set. Running in local trace recording mode.')
      }
   }

   /**
    * Sanitize and mask PII (Emails, Phone numbers, Patient Names) for safe tracing compliance
    */
   sanitizeMetadata(metadata: TraceMetadata): Record<string, any> {
      const sanitized: Record<string, any> = { ...metadata }

      if (sanitized.email) {
         sanitized.email = sanitized.email.replace(/^(.{2})(.*)(@.*)$/, '$1***$3')
      }

      if (sanitized.phone) {
         sanitized.phone = sanitized.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1-****-$2')
      }

      if (sanitized.patientName) {
         const parts = sanitized.patientName.split(' ')
         sanitized.patientName = parts.map((p) => p[0] + '***').join(' ')
      }

      return sanitized
   }

   /**
    * Log graph execution run trace to LangSmith
    */
   async traceRun(params: {
      name: string
      runType: 'llm' | 'chain' | 'tool' | 'prompt'
      inputs: Record<string, any>
      outputs?: Record<string, any>
      metadata?: TraceMetadata
      error?: string
      latencyMs?: number
   }) {
      const sanitizedMeta = this.sanitizeMetadata({
         clinicId: params.metadata?.clinicId || 'apex-health-clinic',
         sessionId: params.metadata?.sessionId || 'anon_session',
         environment: process.env.NODE_ENV || 'development',
         ...params.metadata,
      })

      if (this.client && this.isTracingEnabled) {
         try {
            await this.client.createRun({
               name: params.name,
               run_type: params.runType,
               inputs: params.inputs,
               outputs: params.outputs,
               error: params.error,
               extra: { metadata: sanitizedMeta, latencyMs: params.latencyMs },
               project_name: process.env.LANGSMITH_PROJECT || 'clinic-agent',
               start_time: Date.now() - (params.latencyMs || 100),
               end_time: Date.now(),
            })
         } catch (err) {
            // Non-blocking log trace warning
            console.warn('LangSmith trace logging error:', err)
         }
      }
   }
}

export const langsmithTracingService = new LangSmithTracingService()
export default langsmithTracingService
