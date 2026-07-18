import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
   open: boolean
   onOpenChange: (open: boolean) => void
   title?: string
   description?: string
   confirmLabel?: string
   cancelLabel?: string
   onConfirm: () => void
   isLoading?: boolean
   variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
   open,
   onOpenChange,
   title = 'Are you sure?',
   description = 'This action cannot be undone.',
   confirmLabel = 'Confirm',
   cancelLabel = 'Cancel',
   onConfirm,
   isLoading = false,
   variant = 'default',
}: ConfirmDialogProps) {
   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>{title}</DialogTitle>
               <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                  {cancelLabel}
               </Button>
               <Button
                  variant={variant === 'destructive' ? 'destructive' : 'default'}
                  onClick={onConfirm}
                  disabled={isLoading}
               >
                  {isLoading ? 'Please wait...' : confirmLabel}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   )
}
