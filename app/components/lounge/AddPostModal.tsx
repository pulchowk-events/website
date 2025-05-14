'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { X, Link as LinkIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';
import { Image as ImageIcon } from 'lucide-react';
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
    redirect_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/lounge/posts/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          content: formData.content.trim(),
          redirect_url: formData.redirect_url.trim() || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to submit post');
      }

      toast.success('Post created successfully!');
      
      // First refresh the router to trigger server-side revalidation
      router.refresh();
      
      // Then close the modal which will trigger the immediate client-side refresh
      onClose();
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit post');
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
          {/* Header */}
          <div className="border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-white">
                Create Post
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* User Info */}
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
                <span className="text-white font-medium">
                  {session?.user?.name}
                </span>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as PostCategory })}
                        className="text-sm bg-zinc-800 text-zinc-400 rounded px-2 py-1 border border-zinc-700"
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
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white text-lg font-medium placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 mb-4"
              required
            />

            {/* Content */}
            <textarea
              placeholder="What's on your mind?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full min-h-[120px] bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 mb-4 resize-none"
              required
            />

          <div className="flex flex-col gap-4">
            {/* Image Upload Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDonationModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              >
                <ImageIcon size={20} />
                <span>Add Image</span>
              </button>
            </div>

              {/* Donation Modal */}
              <NeedDonationModal 
                isOpen={showDonationModal}
                onClose={() => setShowDonationModal(false)}
              />

            {/* URL Reference */}
            <div className="flex items-center gap-2 p-3 bg-zinc-800/30 border border-zinc-700 rounded-lg mb-6">
              <LinkIcon size={20} className="text-zinc-400" />
              <input
                type="url"
                placeholder="Add a reference link (optional)"
                value={formData.redirect_url}
                onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                className="w-full bg-transparent text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
    </Dialog>
  );
}