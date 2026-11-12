'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface DeleteButtonProps {
  eventId: string;
  className?: string;
  onSuccess?: () => void;
}

export default function DeleteButton({ eventId, className = '', onSuccess }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/events/remove?id=' + eventId, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete event');
      toast.success('Event deleted');
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          className={className || 'event-card__delete-btn'}
          aria-label="Delete event"
        >
          <Trash2 size={14} />
        </button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0,0,0,.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        />
        <AlertDialog.Content
          className="modal"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100vw - 32px)',
            maxWidth: 440,
            zIndex: 51,
          }}
        >
          <header className="modal__head">
            <AlertDialog.Title className="modal__title">Delete event</AlertDialog.Title>
          </header>

          <div className="modal__body">
            <AlertDialog.Description style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--m)' }}>
              This cannot be undone. The event is permanently removed.
            </AlertDialog.Description>
          </div>

          <div className="modal__foot">
            <AlertDialog.Cancel asChild>
              <button type="button" className="btn btn--secondary">
                <span className="btn__label">Cancel</span>
                <span className="btn__label btn__label--dup" aria-hidden="true">Cancel</span>
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn--primary"
                style={{ background: 'var(--danger)', color: 'var(--t)' }}
              >
                <span className="btn__label">{isDeleting ? 'Deleting…' : 'Delete event'}</span>
                <span
                  className="btn__label btn__label--dup"
                  aria-hidden="true"
                  style={{ background: 'var(--danger)', color: 'var(--t)' }}
                >
                  {isDeleting ? 'Deleting…' : 'Delete event'}
                </span>
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
