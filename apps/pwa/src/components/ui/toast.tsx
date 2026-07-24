import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastMessage {
   id: string
   type: 'success' | 'info' | 'error'
   message: string
   visible?: boolean
}

interface ToastContainerProps {
   toasts: ToastMessage[]
   onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
   if (!toasts || toasts.length === 0) return null

   return (
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
         {toasts.map((toast) => (
            <div
               key={toast.id}
               className={cn(
                  'pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg transition-all duration-300 transform',
                  toast.visible === false
                     ? 'opacity-0 translate-y-2 scale-95'
                     : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-2',
                  toast.type === 'success' &&
                     'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
                  toast.type === 'info' &&
                     'bg-blue-50 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
                  toast.type === 'error' &&
                     'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
               )}
            >
               <div className="flex items-center gap-2.5 overflow-hidden">
                  {toast.type === 'success' && (
                     <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {toast.type === 'info' && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />}
                  {toast.type === 'error' && (
                     <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <span className="text-xs font-medium truncate">{toast.message}</span>
               </div>
               <button
                  onClick={() => onDismiss(toast.id)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors ml-2 shrink-0"
               >
                  <X className="h-3.5 w-3.5 opacity-70" />
               </button>
            </div>
         ))}
      </div>
   )
}
