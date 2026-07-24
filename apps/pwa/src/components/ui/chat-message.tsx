import { cn } from '@/lib/utils'
import { Download, FileText } from 'lucide-react'
import { env } from '@/config/env'
import type { ReferencePdf } from '@/type/pdf'

interface ChatMessageProps {
   role: 'user' | 'assistant'
   message: string
   createdAt?: string
   references?: ReferencePdf[]
}

export function ChatMessage({ role, message, createdAt, references }: ChatMessageProps) {
   const isUser = role === 'user'

   return (
      <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
         <div
            className={cn(
               'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
               isUser ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm',
            )}
         >
            <p className="whitespace-pre-wrap text-sm leading-6">{message}</p>

            {references && references.length > 0 && (
               <div className="mt-3 pt-2 border-t border-border/50 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                     Source References:
                  </span>
                  <div className="flex flex-wrap gap-2">
                     {references.map((ref, idx) => (
                        <a
                           key={idx}
                           href={ref.url.startsWith('http') ? ref.url : `${env.apiUrl}${ref.url}`}
                           download={ref.name}
                           target="_blank"
                           rel="noreferrer"
                           className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-background hover:bg-accent border rounded-lg transition-colors text-primary shadow-xs"
                        >
                           <FileText className="h-3.5 w-3.5 text-red-500" />
                           <span className="truncate max-w-[150px]">{ref.name}</span>
                           <Download className="h-3 w-3 text-muted-foreground" />
                        </a>
                     ))}
                  </div>
               </div>
            )}

            {createdAt && (
               <p className={cn('mt-2 text-xs', isUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                  {createdAt}
               </p>
            )}
         </div>
      </div>
   )
}
