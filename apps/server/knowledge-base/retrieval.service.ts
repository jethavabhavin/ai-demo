export interface DocumentChunk {
   id: string
   title: string
   category: 'DOCTORS' | 'TIMINGS' | 'SERVICES' | 'FEES' | 'POLICIES' | 'FAQS' | 'INSURANCE'
   content: string
}

export const CLINIC_KNOWLEDGE_BASE: DocumentChunk[] = [
   {
      id: 'doc_1',
      title: 'Clinic Timings and Working Hours',
      category: 'TIMINGS',
      content:
         'Apex Health Clinic is open Monday to Friday from 8:00 AM to 8:00 PM, and Saturday from 9:00 AM to 5:00 PM. We are closed on Sundays and national public holidays. Emergency consultation is available 24/7 via our emergency desk hotline.',
   },
   {
      id: 'doc_2',
      title: 'Cardiology Department and Doctors',
      category: 'DOCTORS',
      content:
         'Our Cardiology Department is headed by Dr. Rajesh Patel, MD, DM (Cardiology), with over 18 years of clinical experience in interventional cardiology and preventive heart care. Dr. Patel is available for consultations on Monday, Wednesday, and Friday from 9:00 AM to 4:00 PM.',
   },
   {
      id: 'doc_3',
      title: 'Pediatrics Department and Doctors',
      category: 'DOCTORS',
      content:
         'Dr. Sarah Jenkins, MD (Pediatrics), leads the Pediatrics & Child Care Department. She specializes in newborn care, child immunization, growth monitoring, and pediatric infectious diseases. Consultations available Tuesday, Thursday, and Saturday from 10:00 AM to 3:00 PM.',
   },
   {
      id: 'doc_4',
      title: 'Neurology Department and Doctors',
      category: 'DOCTORS',
      content:
         'Dr. Michael Chen, MD (Neurology), specializes in migraine management, stroke rehabilitation, epilepsy, and peripheral neuropathy. Available Monday through Thursday from 11:00 AM to 5:00 PM.',
   },
   {
      id: 'doc_5',
      title: 'Dermatology Department and Doctors',
      category: 'DOCTORS',
      content:
         'Dr. Emily Davis, MD (Dermatology), offers comprehensive skin, hair, and laser treatments including acne management, eczema, cosmetic dermatology, and skin allergy testing. Available Monday, Wednesday, and Saturday from 9:00 AM to 2:00 PM.',
   },
   {
      id: 'doc_6',
      title: 'Orthopedics Department and Doctors',
      category: 'DOCTORS',
      content:
         'Dr. Robert Taylor, MS (Orthopedics), leads Joint Replacement & Sports Medicine. Specializing in knee replacement, arthroscopy, fracture care, and back pain therapy. Available Monday to Friday from 1:00 PM to 6:00 PM.',
   },
   {
      id: 'doc_7',
      title: 'Clinic Services Overview',
      category: 'SERVICES',
      content:
         'Apex Health Clinic provides Primary Care, Specialist Consultations, In-house Diagnostic Laboratory (Blood tests, Pathology), Digital X-Ray, ECG, Ultrasound Imaging, Routine Health Checks, Vaccinations, and Minor Outpatient Surgeries.',
   },
   {
      id: 'doc_8',
      title: 'Consultation Fees and Billing',
      category: 'FEES',
      content:
         'General Physician consultation fee is $60. Specialist Doctor consultation fee (Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology) is $120. Follow-up consultations within 14 days are discounted at $40.',
   },
   {
      id: 'doc_9',
      title: 'Insurance & Payment Policies',
      category: 'INSURANCE',
      content:
         'We accept major health insurance providers including Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, Medicare, and Alliance Health. Cash, Credit/Debit cards, Apple Pay, and HSA/FSA cards are accepted for co-pays and self-pay visits.',
   },
   {
      id: 'doc_10',
      title: 'Appointment Booking & Cancellation Policy',
      category: 'POLICIES',
      content:
         'Appointments can be booked online or via our AI assistant up to 30 days in advance. Cancellations and rescheduling are free of charge if done at least 2 hours prior to the scheduled appointment time.',
   },
   {
      id: 'doc_11',
      title: 'Frequently Asked Questions (FAQs)',
      category: 'FAQS',
      content:
         'Q: Do I need a referral to see a specialist? A: Most specialists do not require a referral unless required by your specific insurance plan. Q: Where is the clinic located? A: Apex Health Clinic is located at 742 Health Science Boulevard, Suite 300. Ample free parking is available on-site.',
   },
]

class KnowledgeBaseRetrievalService {
   /**
    * Performs vector keyword and semantic similarity search over clinic knowledge base
    */
   async searchKnowledgeBase(query: string, limit: number = 3): Promise<DocumentChunk[]> {
      const qLower = query.toLowerCase()

      // Calculate simple tf-idf / keyword term match score
      const scored = CLINIC_KNOWLEDGE_BASE.map((doc) => {
         let score = 0
         const contentLower = doc.content.toLowerCase()
         const titleLower = doc.title.toLowerCase()

         const words = qLower.split(/\W+/).filter((w) => w.length > 2)
         for (const word of words) {
            if (titleLower.includes(word)) score += 5
            if (contentLower.includes(word)) score += 2
         }

         return { doc, score }
      })

      // Sort descending by score
      scored.sort((a, b) => b.score - a.score)

      // Filter docs with score > 0
      const matches = scored.filter((s) => s.score > 0).map((s) => s.doc)

      if (matches.length > 0) {
         return matches.slice(0, limit)
      }

      // Default to general clinic overview & timing docs if query mentions clinic
      if (qLower.includes('doctor') || qLower.includes('specialist') || qLower.includes('who')) {
         return CLINIC_KNOWLEDGE_BASE.filter((d) => d.category === 'DOCTORS').slice(0, limit)
      }

      return CLINIC_KNOWLEDGE_BASE.slice(0, limit)
   }
}

export const knowledgeBaseService = new KnowledgeBaseRetrievalService()
export default knowledgeBaseService
