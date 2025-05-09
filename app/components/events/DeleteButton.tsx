'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
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
          className={`${className} bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded transition-colors`}
        >
          Delete
        </button>
      </AlertDialog.Trigger>
      
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-black/50 fixed inset-0 animate-fade-in" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 rounded-lg p-6 w-[90vw] max-w-[500px] shadow-xl">
          <AlertDialog.Title className="text-xl font-semibold mb-4 text-white">
            Delete Event
          </AlertDialog.Title>
          
          <AlertDialog.Description className="text-zinc-300 mb-6">
            Are you sure you want to delete this event? This action cannot be undone.
          </AlertDialog.Description>
          
          <div className="flex justify-end gap-4">
            <AlertDialog.Cancel asChild>
              <button className="px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600 transition-colors">
                Cancel
              </button>
            </AlertDialog.Cancel>
            
            <AlertDialog.Action asChild>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}