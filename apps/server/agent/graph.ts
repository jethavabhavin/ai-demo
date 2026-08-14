import { StateGraph, START, END, MemorySaver } from '@langchain/langgraph'
import { ClinicAgentAnnotation, type ClinicAgentStateType } from './state'
import { inputValidationNode } from './nodes/input-validation.node'
import { guardrailNode } from './nodes/guardrail.node'
import { intentDetectionNode } from './nodes/intent.node'
import { knowledgeNode } from './nodes/knowledge.node'
import { appointmentNode } from './nodes/appointment.node'
import { toolsNode } from './nodes/tools.node'
import { responseNode } from './nodes/response.node'
import { langsmithTracingService } from '../langsmith/tracing'

/**
 * LangGraph Conditional Edge Router (Section 17 requirement)
 */
function routeIntent(state: ClinicAgentStateType): string {
   switch (state.intent) {
      case 'CLINIC_INFO':
         return 'knowledgeNode'

      case 'CHECK_AVAILABILITY':
      case 'BOOK_APPOINTMENT':
      case 'RESCHEDULE_APPOINTMENT':
      case 'CANCEL_APPOINTMENT':
         return 'appointmentNode'

      case 'OUT_OF_SCOPE':
      case 'MEDICAL_ADVICE':
         return 'responseNode'

      default:
         return 'knowledgeNode'
   }
}

// Construct state graph with strongly typed Annotation schema and ToolNode integration
const workflow = new StateGraph(ClinicAgentAnnotation)
   .addNode('inputValidationNode', inputValidationNode)
   .addNode('guardrailNode', guardrailNode)
   .addNode('intentDetectionNode', intentDetectionNode)
   .addNode('knowledgeNode', knowledgeNode)
   .addNode('appointmentNode', appointmentNode)
   .addNode('toolsNode', toolsNode)
   .addNode('responseNode', responseNode)

   .addEdge(START, 'inputValidationNode')
   .addEdge('inputValidationNode', 'guardrailNode')
   .addEdge('guardrailNode', 'intentDetectionNode')

   .addConditionalEdges('intentDetectionNode', routeIntent, {
      knowledgeNode: 'knowledgeNode',
      appointmentNode: 'appointmentNode',
      responseNode: 'responseNode',
   })

   .addEdge('knowledgeNode', 'responseNode')
   .addEdge('appointmentNode', 'toolsNode')
   .addEdge('toolsNode', 'responseNode')
   .addEdge('responseNode', END)

// Memory Checkpointer for session-based thread conversation history
const checkpointer = new MemorySaver()
export const compiledClinicAgentGraph = workflow.compile({ checkpointer })

/**
 * Runner helper with automatic LangSmith tracing and session state management
 */
export class GraphAgentRunner {
   private sessionStates: Map<string, ClinicAgentStateType> = new Map()

   async run(params: {
      userQuery: string
      sessionId?: string
      messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
   }): Promise<ClinicAgentStateType> {
      const startTime = Date.now()
      const sessionId = params.sessionId || `session_${Date.now()}`

      const existingState = this.sessionStates.get(sessionId)

      const inputState = {
         ...existingState,
         userQuery: params.userQuery,
         messages: [
            ...(existingState?.messages || []),
            {
               role: 'user' as const,
               content: params.userQuery,
            },
         ].slice(-8), // Keep only recent 8 messages to minimize token usage
         sessionId,
      }

      try {
         const result = (await compiledClinicAgentGraph.invoke(inputState, {
            configurable: { thread_id: sessionId },
         })) as ClinicAgentStateType

         const latencyMs = Date.now() - startTime
         this.sessionStates.set(sessionId, result)

         await langsmithTracingService.traceRun({
            name: 'ClinicAgentGraphExecution',
            runType: 'chain',
            inputs: { userQuery: params.userQuery, sessionId },
            outputs: {
               intent: result.intent,
               response: result.finalResponse,
               requiresConfirmation: result.requiresConfirmation,
               availableSlots: result.availableSlots,
            },
            metadata: {
               sessionId,
               intent: result.intent,
               doctor: result.doctorName,
               appointmentOperation: result.confirmationType || result.intent,
            },
            latencyMs,
         })

         return result
      } catch (err: any) {
         console.error('LangGraph Execution Error:', err)
         await langsmithTracingService.traceRun({
            name: 'ClinicAgentGraphExecution',
            runType: 'chain',
            inputs: { userQuery: params.userQuery, sessionId },
            error: err.message,
            metadata: { sessionId },
         })

         return {
            ...inputState,
            error: err.message,
            finalResponse: 'An error occurred processing your request. Please try again or contact the clinic desk.',
         } as unknown as ClinicAgentStateType
      }
   }

   /**
    * Stream agent graph execution with SSE token chunks
    */
   async runStream(
      params: {
         userQuery: string
         sessionId?: string
      },
      onToken: (token: string) => void,
      onComplete: (state: ClinicAgentStateType) => void,
   ): Promise<void> {
      const finalState = await this.run(params)
      const fullText = finalState.finalResponse || ''

      // Stream text out in rapid character/word chunks for real-time visual streaming
      const words = fullText.split(/(\s+)/)
      for (const word of words) {
         if (word) {
            onToken(word)
            // Small delay between tokens to mimic real-time LLM streaming
            await new Promise((r) => setTimeout(r, 15))
         }
      }

      onComplete(finalState)
   }
}

export const graphAgent = new GraphAgentRunner()
export default graphAgent
