'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'

interface DeleteButtonProps {
  eventId: string
  className?: string
  onSuccess?: () => void
}

export default function DeleteButton({ 
  eventId, 
  className = '',
  onSuccess 
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/events/remove?id=${eventId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      toast.success('Event deleted successfully')
      onSuccess?.()
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete event')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          className={`${className} flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-md backdrop-blur-sm transition-all duration-200 border border-red-500/10 shadow-sm group`}
          aria-label="Delete event"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-200/90 group-hover:text-red-100" />
        </button>
      </AlertDialog.Trigger>
      
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in-0 z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white/10 rounded-xl p-6 w-[90vw] max-w-[450px] shadow-xl animate-in fade-in-0 zoom-in-95 z-50">
          <AlertDialog.Title className="text-xl font-semibold mb-3 text-white/90">
            Delete Event
          </AlertDialog.Title>
          
          <AlertDialog.Description className="text-zinc-300 mb-6 text-sm leading-relaxed">
            Are you sure you want to delete this event? This action cannot be undone and will permanently remove the event from the system.
          </AlertDialog.Description>
          
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button className="px-4 py-2 rounded-md bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium">
                Cancel
              </button>
            </AlertDialog.Cancel>
            
            <AlertDialog.Action asChild>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}