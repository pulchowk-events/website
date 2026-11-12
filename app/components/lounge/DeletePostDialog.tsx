'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface DeletePostDialogProps {
  postId: string;
  postTitle: string;
  onClose: () => void;
}

export default function DeletePostDialog({
  postId,
  postTitle,
  onClose,
}: DeletePostDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/lounge/posts/' + postId, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete post');

      toast.success('Post deleted');
      onClose();
      router.push('/lounge');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="modal-backdrop">
      <Dialog.Panel
        className="modal"
        style={{ maxWidth: 440 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <header className="modal__head">
          <Dialog.Title className="modal__title">Delete post</Dialog.Title>
          <button
            type="button"
            onClick={onClose}
            className="modal__close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="modal__body">
          <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--m)' }}>
            Delete &ldquo;{postTitle}&rdquo;? This action cannot be undone and will delete all
            comments associated with this post.
          </p>
        </div>

        <div className="modal__foot">
          <button
            type="button"
            onClick={onClose}
            className="btn btn--secondary"
            disabled={isDeleting}
          >
            <span className="btn__label">Cancel</span>
            <span className="btn__label btn__label--dup" aria-hidden="true">Cancel</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn--primary"
            style={{ background: 'var(--danger)', color: 'var(--t)' }}
          >
            <span className="btn__label">{isDeleting ? 'Deleting…' : 'Delete post'}</span>
            <span
              className="btn__label btn__label--dup"
              aria-hidden="true"
              style={{ background: 'var(--danger)', color: 'var(--t)' }}
            >
              {isDeleting ? 'Deleting…' : 'Delete post'}
            </span>
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
