'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { toast } from 'sonner';

interface DeletePostDialogProps {
  postId: string;
  postTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeletePostDialog({
  postId,
  postTitle,
  isOpen,
  onClose
}: DeletePostDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/lounge/posts/remove?id=${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete post');
      }

      toast.success('Post deleted successfully');
      router.refresh();
      router.push('/lounge');
    } catch (error) {
      console.error('Deletion error:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to delete post'
      );
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Title className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

        <div className="relative bg-zinc-900 p-6 rounded-xl max-w-md w-full">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Delete Post
          </Dialog.Title>

          <p className="text-zinc-400 mb-6">
            Are you sure you want to delete &quot;{postTitle}&quot;? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}