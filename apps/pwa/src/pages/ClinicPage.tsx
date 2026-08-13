import React from 'react'
import {
   Calendar,
   Clock,
   Phone,
   MapPin,
   ShieldCheck,
   Stethoscope,
   Heart,
   Brain,
   Activity,
   Sparkles,
   CheckCircle,
   Award,
   Users,
} from 'lucide-react'
import ChatWidget from '../components/AIChat/ChatWidget'

export const ClinicPage: React.FC = () => {
   const doctors = [
      {
         name: 'Dr. Rajesh Patel',
         specialty: 'Cardiology',
         experience: '18 Years Experience',
         availability: 'Mon, Wed, Fri (09:00 AM - 04:00 PM)',
         icon: Heart,
         color: 'bg-red-500',
         lightColor: 'bg-red-50 text-red-700 border-red-200',
      },
      {
         name: 'Dr. Sarah Jenkins',
         specialty: 'Pediatrics',
         experience: '14 Years Experience',
         availability: 'Tue, Thu, Sat (10:00 AM - 03:00 PM)',
         icon: Users,
         color: 'bg-amber-500',
         lightColor: 'bg-amber-50 text-amber-700 border-amber-200',
      },
      {
         name: 'Dr. Michael Chen',
         specialty: 'Neurology',
         experience: '15 Years Experience',
         availability: 'Mon - Thu (11:00 AM - 05:00 PM)',
         icon: Brain,
         color: 'bg-purple-500',
         lightColor: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      {
         name: 'Dr. Emily Davis',
         specialty: 'Dermatology',
         experience: '12 Years Experience',
         availability: 'Mon, Wed, Sat (09:00 AM - 02:00 PM)',
         icon: Sparkles,
         color: 'bg-emerald-500',
         lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
      {
         name: 'Dr. Robert Taylor',
         specialty: 'Orthopedics',
         experience: '16 Years Experience',
         availability: 'Mon - Fri (01:00 PM - 06:00 PM)',
         icon: Activity,
         color: 'bg-blue-500',
         lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
      },
   ]

   return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
         {/* Top Banner */}
         <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-blue-950 px-6 py-2 text-center text-xs text-blue-100">
            <span className="inline-flex items-center gap-1.5 font-medium">
               <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
               Apex Health Clinic AI Receptionist is active. Powered by <strong>LangGraph</strong> &amp;{' '}
               <strong>LangSmith</strong>.
            </span>
         </div>

         {/* Navigation Header */}
         <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
               <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                     <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                     <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Apex Health Clinic</h1>
                     <p className="text-[11px] font-medium text-slate-500">
                        Excellence in Patient Care &amp; Agentic AI
                     </p>
                  </div>
               </div>

               <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
                  <a href="#services" className="hover:text-blue-600 transition-colors">
                     Services
                  </a>
                  <a href="#doctors" className="hover:text-blue-600 transition-colors">
                     Specialist Doctors
                  </a>
                  <a href="#timings" className="hover:text-blue-600 transition-colors">
                     Clinic Timings
                  </a>
                  <a href="#location" className="hover:text-blue-600 transition-colors">
                     Location
                  </a>
               </div>

               <div className="flex items-center gap-3">
                  <a
                     href="tel:+18005550199"
                     className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                     <Phone className="h-3.5 w-3.5 text-blue-600" />
                     <span>+1 (800) 555-0199</span>
                  </a>
               </div>
            </div>
         </header>

         {/* Hero Section */}
         <section className="relative overflow-hidden bg-linear-to-b from-blue-50/60 via-indigo-50/30 to-slate-50 py-16 px-6">
            <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
               <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-800 shadow-xs mb-6">
                     <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                     <span>24/7 AI Receptionist &amp; Google Calendar Booking</span>
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                     Modern Healthcare Meets{' '}
                     <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                        Agentic AI
                     </span>
                  </h2>

                  <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                     Book specialist consultations, check real-time doctor slot availability, reschedule appointments,
                     and access clinic information effortlessly with our secure{' '}
                     <strong>LangGraph-orchestrated AI Assistant</strong>.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                     <div className="flex items-center gap-2 rounded-2xl bg-white p-3 shadow-md border border-slate-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                           <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                           <span className="text-xs font-bold text-slate-900 block">Instant Confirmation</span>
                           <span className="text-[11px] text-slate-500">Google Calendar Synced</span>
                        </div>
                     </div>

                     <div className="flex items-center gap-2 rounded-2xl bg-white p-3 shadow-md border border-slate-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                           <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                           <span className="text-xs font-bold text-slate-900 block">Strict Guardrails</span>
                           <span className="text-[11px] text-slate-500">Medical Safety Compliant</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Hero Preview Card */}
               <div className="lg:col-span-5">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                           <h3 className="text-sm font-bold text-slate-900">Clinic Operational Overview</h3>
                           <p className="text-[11px] text-slate-500">Real-time status</p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                           Open Today
                        </span>
                     </div>

                     <div className="mt-4 space-y-3 text-xs">
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                           <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-slate-700">Today&apos;s Hours</span>
                           </div>
                           <span className="font-bold text-slate-900">08:00 AM - 08:00 PM</span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                           <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-indigo-600" />
                              <span className="font-semibold text-slate-700">Available Specialists</span>
                           </div>
                           <span className="font-bold text-slate-900">5 Departments</span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                           <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-emerald-600" />
                              <span className="font-semibold text-slate-700">Calendar Integration</span>
                           </div>
                           <span className="font-bold text-emerald-700">Google Calendar</span>
                        </div>
                     </div>

                     <div className="mt-6 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-blue-100">Need help booking?</p>
                              <p className="text-sm font-bold mt-0.5">Ask our AI Assistant</p>
                           </div>
                           <span className="text-2xl">🤖</span>
                        </div>
                        <p className="mt-2 text-[11px] text-blue-100">
                           Click the widget on the bottom-right to check doctor slots or schedule an appointment!
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Specialist Doctors Section */}
         <section id="doctors" className="py-16 px-6 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
               <h3 className="text-2xl font-bold text-slate-900">Our Specialist Doctors</h3>
               <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  Our team of experienced medical professionals is dedicated to delivering personalized, compassionate
                  care.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {doctors.map((doc, idx) => {
                  const Icon = doc.icon
                  return (
                     <div
                        key={idx}
                        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-all group"
                     >
                        <div className="flex items-center gap-4">
                           <div
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${doc.color}`}
                           >
                              <Icon className="h-6 w-6" />
                           </div>
                           <div>
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                 {doc.name}
                              </h4>
                              <span
                                 className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${doc.lightColor}`}
                              >
                                 {doc.specialty}
                              </span>
                           </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                           <div className="flex items-center gap-2">
                              <Award className="h-3.5 w-3.5 text-slate-400" />
                              <span>{doc.experience}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>{doc.availability}</span>
                           </div>
                        </div>
                     </div>
                  )
               })}
            </div>
         </section>

         {/* Services & Location */}
         <section id="timings" className="bg-slate-100/70 py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="rounded-3xl bg-white p-8 border border-slate-200/80 shadow-xs">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                     <Clock className="h-5 w-5 text-blue-600" />
                     Clinic Timings &amp; Working Hours
                  </h3>
                  <div className="mt-4 space-y-3 text-xs">
                     <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="font-semibold text-slate-700">Monday - Friday</span>
                        <span className="font-bold text-slate-900">08:00 AM - 08:00 PM</span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="font-semibold text-slate-700">Saturday</span>
                        <span className="font-bold text-slate-900">09:00 AM - 05:00 PM</span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="font-semibold text-slate-700">Sunday &amp; Holidays</span>
                        <span className="font-bold text-red-600">Closed (Emergency Hotline Active)</span>
                     </div>
                  </div>
               </div>

               <div className="rounded-3xl bg-white p-8 border border-slate-200/80 shadow-xs" id="location">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                     <MapPin className="h-5 w-5 text-indigo-600" />
                     Clinic Location &amp; Contact
                  </h3>
                  <div className="mt-4 space-y-3 text-xs text-slate-600">
                     <p className="font-medium text-slate-800">Apex Health Clinic</p>
                     <p>742 Health Science Boulevard, Suite 300</p>
                     <p>Free on-site patient parking &amp; wheelchair accessible.</p>
                     <div className="pt-2 text-blue-600 font-semibold flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        <span>Reception: +1 (800) 555-0199</span>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Footer */}
         <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
               <p>© 2026 Apex Health Clinic. All rights reserved.</p>
               <p className="flex items-center gap-1.5 font-medium text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  LangGraph Agentic AI &amp; LangSmith Traced
               </p>
            </div>
         </footer>

         {/* Floating Bottom-Right AI Assistant Button */}
         <ChatWidget />
      </div>
   )
}

export default ClinicPage
