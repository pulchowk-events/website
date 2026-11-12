'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        />
        <Dialog.Content
          className="modal"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100vw - 32px)',
            maxWidth: 420,
            zIndex: 51,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="modal__head">
            <Dialog.Title className="modal__title">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="modal__close" aria-label="Close">
                <X size={18} />
              </button>
            </Dialog.Close>
          </header>

          <div className="modal__body">
            <Dialog.Description style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--m)' }}>
              {description}
            </Dialog.Description>
          </div>

          <div className="modal__foot">
            <button type="button" onClick={onClose} className="btn btn--secondary">
              <span className="btn__label">Cancel</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">Cancel</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="btn btn--primary"
              style={{ background: 'var(--danger)', color: 'var(--t)' }}
            >
              <span className="btn__label">Delete</span>
              <span
                className="btn__label btn__label--dup"
                aria-hidden="true"
                style={{ background: 'var(--danger)', color: 'var(--t)' }}
              >
                Delete
              </span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
