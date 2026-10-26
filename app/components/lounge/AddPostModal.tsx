'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { X, Link as LinkIcon, Image as ImageIcon, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'sonner';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';
import NeedDonationModal from './NeedDonationModal';

interface AddPostModalProps {
  onClose: () => void;
}

export default function AddPostModal({ onClose }: AddPostModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'discussions' as PostCategory,
    redirect_url: '',
    show_embed_image: true,
  });

  // Only show the image toggle when the URL looks valid
  const urlLooksValid = /^https?:\/\/\S+\.\S+/.test(formData.redirect_url.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/lounge/posts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          content: formData.content.trim(),
          redirect_url: formData.redirect_url.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to submit post');
      }

      toast.success('Post created successfully!');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" aria-hidden="true" />

        <div className="relative bg-popover border border-border rounded-xl w-full max-w-xl shadow-2xl">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-foreground">
                Create Post
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
            {/* Author + category */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <Image
                  src={session?.user?.image || '/default-avatar.png'}
                  alt={session?.user?.name || 'User'}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground font-medium">
                  {session?.user?.name}
                </span>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as PostCategory })}
                  className="text-sm bg-background text-foreground rounded px-2 py-1 border border-border"
                >
                  {Object.entries(categoryDisplayMap).map(([value, label]) => (
                    <option key={value} value={value}>
                      {categoryIcons[value as PostCategory]} {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              placeholder="Post title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 mb-4"
              required
            />

            {/* Content */}
            <textarea
              placeholder="What's on your mind?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full min-h-[120px] bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 mb-4 resize-none"
              required
            />

            <div className="flex flex-col gap-3">
              {/* Image upload upsell */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDonationModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-accent text-secondary-foreground transition-colors"
                >
                  <ImageIcon size={20} />
                  <span>Add Image</span>
                </button>
              </div>

              <NeedDonationModal
                isOpen={showDonationModal}
                onClose={() => setShowDonationModal(false)}
              />

              {/* Reference URL */}
              <div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-lg">
                  <LinkIcon size={20} className="text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="Add a reference link (optional)"
                    value={formData.redirect_url}
                    onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                {/* Image embed toggle — only when URL is present */}
                {urlLooksValid && (
                  <label className="flex items-start gap-3 mt-3 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg cursor-pointer">
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
                        We'll try to fetch the page's preview image. If the site doesn't provide one, your post appears normally.
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
    </Dialog>
  );
}