import { cn } from '@/lib/utils'

interface ChatMessageProps {
   role: 'user' | 'assistant'
   message: string
   createdAt?: string
}

export function ChatMessage({ role, message, createdAt }: ChatMessageProps) {
   const isUser = role === 'user'

   return (
      <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
         <div
            className={cn(
               'max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
               isUser ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm',
            )}
         >
            <p className="whitespace-pre-wrap text-sm leading-6">{message}</p>

            {createdAt && (
               <p className={cn('mt-2 text-xs', isUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                  {createdAt}
               </p>
            )}
         </div>
      </div>
   )
}
