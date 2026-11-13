'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface RemoveButtonProps {
  productId: number;
  productName: string;
  isOwner?: boolean;
}

export function RemoveButton({ productId, productName, isOwner = false }: RemoveButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isConfirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) setIsConfirmOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isConfirmOpen, isDeleting]);

  const handleRemove = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch('/api/products/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isOwner }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to remove product');

      toast.success('Project removed');
      setIsConfirmOpen(false);
      router.push('/product-hunt');
      router.refresh();
    } catch (error) {
      console.error('Removal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        disabled={isDeleting}
        className="btn btn--secondary"
        style={{ color: 'var(--danger)' }}
      >
        <span className="btn__label">
          <Trash2 size={14} style={{ marginRight: 8 }} />
          Remove product
        </span>
        <span className="btn__label btn__label--dup" aria-hidden="true">
          <Trash2 size={14} style={{ marginRight: 8 }} />
          Remove product
        </span>
      </button>

      {isConfirmOpen && (
        <div
          className="modal-backdrop"
          onClick={() => !isDeleting && setIsConfirmOpen(false)}
        >
          <div
            className="modal"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal__head">
              <h2 className="modal__title">Remove product</h2>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="modal__close"
                aria-label="Close"
                disabled={isDeleting}
              >
                <X size={18} />
              </button>
            </header>

            <div className="modal__body">
              <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--m)' }}>
                Remove &ldquo;{productName}&rdquo;? This action cannot be undone.
              </p>
            </div>

            <div className="modal__foot">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="btn btn--secondary"
                disabled={isDeleting}
              >
                <span className="btn__label">Cancel</span>
                <span className="btn__label btn__label--dup" aria-hidden="true">Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isDeleting}
                className="btn btn--primary"
                style={{ background: 'var(--danger)', color: 'var(--t)' }}
              >
                <span className="btn__label">{isDeleting ? 'Removing…' : 'Remove'}</span>
                <span
                  className="btn__label btn__label--dup"
                  aria-hidden="true"
                  style={{ background: 'var(--danger)', color: 'var(--t)' }}
                >
                  {isDeleting ? 'Removing…' : 'Remove'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
