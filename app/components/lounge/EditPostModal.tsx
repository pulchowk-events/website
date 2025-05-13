'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { X, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';

interface EditPostModalProps {
  post: {
    id: string;
    title: string;
    content: string;
    category: PostCategory;
    redirect_url: string | null;
  };
  onClose: () => void;
}

export default function EditPostModal({ post, onClose }: EditPostModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content,
    category: post.category,
    redirect_url: post.redirect_url || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/lounge/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update post');
      }

      toast.success('Post updated successfully!');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update post');
    } finally {
      setIsSubmitting(false);
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

        <div className="relative bg-zinc-900 rounded-xl w-full max-w-xl shadow-2xl">
          <div className="border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-white">
                Edit Post
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Post title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white text-lg font-medium placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  required
                />
              </div>

              <div>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as PostCategory })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white"
                >
                  {Object.entries(categoryDisplayMap).map(([value, label]) => (
                    <option key={value} value={value}>
                      {categoryIcons[value as PostCategory]} {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <textarea
                  placeholder="Post content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full min-h-[200px] bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg">
                <LinkIcon size={20} className="text-zinc-400" />
                <input
                  type="url"
                  placeholder="Reference link (optional)"
                  value={formData.redirect_url}
                  onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                  className="w-full bg-transparent text-white placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}