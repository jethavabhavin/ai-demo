import type { ClinicAgentStateType } from '../state'

// Explicit out-of-scope triggers
const OUT_OF_SCOPE_KEYWORDS = [
   'python',
   'javascript',
   'code',
   'programming',
   'election',
   'president',
   'bitcoin',
   'crypto',
   'joke',
   'poem',
   'song',
   'weather',
   'football',
   'recipe',
   'movie',
]

// Medical advice / diagnosis / prescription triggers
const MEDICAL_ADVICE_KEYWORDS = [
   'diagnose',
   'diagnosis',
   'what disease',
   'what illness',
   'what medicine',
   'what drug',
   'dosage',
   'what dose',
   'prescription',
   'prescribe',
   'treatment for',
   'cure for',
   'my symptoms',
   'headache medicine',
   'chest pain medicine',
   'how to treat',
]

// Emergency keywords
const EMERGENCY_KEYWORDS = [
   'heart attack',
   'severe chest pain',
   'cannot breathe',
   'unconscious',
   'heavy bleeding',
   'stroke symptoms',
   'anaphylaxis',
]

export async function guardrailNode(state: ClinicAgentStateType): Promise<Partial<ClinicAgentStateType>> {
   const q = (state.userQuery || '').toLowerCase()

   // 1. Check for Emergency situations
   for (const emergencyKey of EMERGENCY_KEYWORDS) {
      if (q.includes(emergencyKey)) {
         return {
            intent: 'MEDICAL_ADVICE',
            finalResponse:
               '⚠️ **EMERGENCY NOTICE**: If you or someone around you is experiencing a life-threatening medical emergency, please call your local emergency medical service (such as 911 or 112) or proceed immediately to the nearest hospital emergency department.\n\nI can help with information about our clinic, doctors, services, and appointments. For diagnosis or treatment advice, please consult a qualified healthcare professional.',
         }
      }
   }

   // 2. Check for Medical Advice / Diagnosis requests
   for (const medKey of MEDICAL_ADVICE_KEYWORDS) {
      if (q.includes(medKey)) {
         return {
            intent: 'MEDICAL_ADVICE',
            finalResponse:
               'I can help with information about our clinic, doctors, services, and appointments. For diagnosis or treatment advice, please consult a qualified healthcare professional.',
         }
      }
   }

   // 3. Check for general out-of-scope requests
   for (const scopeKey of OUT_OF_SCOPE_KEYWORDS) {
      if (q.includes(scopeKey)) {
         return {
            intent: 'OUT_OF_SCOPE',
            finalResponse: 'I can only help with questions about our clinic, doctors, services, and appointments.',
         }
      }
   }

   return {}
}
