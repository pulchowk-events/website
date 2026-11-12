'use client';

import { useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NeedDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NeedDonationModal({ isOpen, onClose }: NeedDonationModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleDonate = () => {
    onClose();
    router.push('/donate');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="modal-backdrop">
      <Dialog.Panel
        className="modal"
        style={{ maxWidth: 420 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <header className="modal__head">
          <Dialog.Title className="modal__title">Help us grow</Dialog.Title>
          <button type="button" onClick={onClose} className="modal__close" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="modal__body">
          <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--m)' }}>
            This is a student-run initiative, so we don&apos;t have the resources to build
            every feature on our roadmap. Donations fund the infrastructure and the
            competitions we run.
          </p>
        </div>

        <div className="modal__foot">
          <button type="button" onClick={onClose} className="btn btn--secondary">
            <span className="btn__label">Maybe later</span>
            <span className="btn__label btn__label--dup" aria-hidden="true">Maybe later</span>
          </button>
          <button type="button" onClick={handleDonate} className="btn btn--primary">
            <span className="btn__label">Donate</span>
            <span className="btn__label btn__label--dup" aria-hidden="true">Donate</span>
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
