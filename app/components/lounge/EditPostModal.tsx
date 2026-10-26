'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { X, Link as LinkIcon, Image as ImageIcon, Info, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';

interface EditPostModalProps {
  post: {
    id: string;
    title: string;
    content: string;
    category: PostCategory;
    redirect_url: string | null;
    image_url: string | null;
    show_embed_image: boolean;
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
    redirect_url: post.redirect_url || '',
    show_embed_image: post.show_embed_image ?? true,
  });

  const urlLooksValid = /^https?:\/\/\S+\.\S+/.test(formData.redirect_url.trim());
  const hasImage = !!post.image_url && formData.show_embed_image;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/lounge/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  const handleRemoveImage = () => {
    setFormData({ ...formData, show_embed_image: false });
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" aria-hidden="true" />

        <div className="relative bg-popover border border-border rounded-xl w-full max-w-xl shadow-2xl">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-foreground">
                Edit Post
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Post title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50"
                required
              />

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as PostCategory })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground"
              >
                {Object.entries(categoryDisplayMap).map(([value, label]) => (
                  <option key={value} value={value}>
                    {categoryIcons[value as PostCategory]} {label}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Post content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full min-h-[200px] bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                required
              />

              {/* Current image preview — only shows when there's one to show */}
              {hasImage && (
                <div className="bg-muted/30 border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Current image
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                  <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
                    <Image
                      src={post.image_url!}
                      alt="Current post image"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Reference URL */}
              <div className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-lg">
                <LinkIcon size={20} className="text-muted-foreground" />
                <input
                  type="url"
                  placeholder="Reference link (optional)"
                  value={formData.redirect_url}
                  onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Image toggle */}
              {urlLooksValid && (
                <label className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_embed_image}
                    onChange={(e) => setFormData({ ...formData, show_embed_image: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-border text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      Show image preview from link
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {!formData.show_embed_image && post.image_url
                        ? 'Image will be removed when you save.'
                        : formData.redirect_url !== (post.redirect_url || '')
                          ? 'Changing the link will refresh the preview image.'
                          : "We'll try to fetch the page's preview image."}
                    </p>
                  </div>
                </label>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-secondary hover:bg-accent text-secondary-foreground rounded-lg"
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