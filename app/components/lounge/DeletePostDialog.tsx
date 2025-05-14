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
  onClose
}: DeletePostDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/lounge/posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete post');
      }

      toast.success('Post deleted successfully');
      router.refresh();
      router.push('/lounge');
      onClose();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Title className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

        <div className="relative bg-zinc-900 rounded-xl w-full max-w-md shadow-2xl">
          <div className="border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-white">
                Delete Post
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete &quot;{postTitle}&quot;? This action cannot be undone 
              and will delete all comments associated with this post.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}