'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Link as LinkIcon, Image as ImageIcon, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'sonner';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';
import NeedDonationModal from './NeedDonationModal';
import { Avatar } from "@/app/components/ui/Avatar";

interface AddPostModalProps {
  onClose: () => void;
}

export default function AddPostModal({ onClose }: AddPostModalProps) {
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

      toast.success('Post created');
      onClose();
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="modal-backdrop">
      <Dialog.Panel className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <header className="modal__head">
          <Dialog.Title className="modal__title">Create post</Dialog.Title>
          <button
            type="button"
            onClick={onClose}
            className="modal__close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="composer__author">
              <span className="composer__avatar">
                <Avatar
                  src={session?.user?.image}
                  name={session?.user?.name}
                  size={40}
                  className="composer__avatar-img"
                />
              </span>
              <span className="composer__author-name">{session?.user?.name}</span>
            </div>

            <div className="tabs" role="tablist" aria-label="Category">
              {(Object.entries(categoryDisplayMap) as [PostCategory, string][]).map(
                ([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    role="tab"
                    aria-selected={formData.category === value}
                    className={'tab' + (formData.category === value ? ' tab--on' : '')}
                    onClick={() => setFormData({ ...formData, category: value })}
                  >
                    {categoryIcons[value]} {label}
                  </button>
                )
              )}
            </div>

            <input
              type="text"
              placeholder="Post title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />

            <textarea
              placeholder="What's on your mind?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input input--multi"
              rows={5}
              required
            />

            <div className="composer__row">
              <button
                type="button"
                onClick={() => setShowDonationModal(true)}
                className="btn btn--secondary"
              >
                <span className="btn__label">
                  <ImageIcon size={14} style={{ marginRight: 8 }} />
                  Add image
                </span>
                <span className="btn__label btn__label--dup" aria-hidden="true">
                  <ImageIcon size={14} style={{ marginRight: 8 }} />
                  Add image
                </span>
              </button>
            </div>

            <NeedDonationModal
              isOpen={showDonationModal}
              onClose={() => setShowDonationModal(false)}
            />

            <div>
              <div className="composer__url">
                <LinkIcon size={14} />
                <input
                  type="url"
                  placeholder="Add a reference link (optional)"
                  value={formData.redirect_url}
                  onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                  className="composer__url-input"
                />
              </div>

              {urlLooksValid && (
                <label className="composer__toggle">
                  <input
                    type="checkbox"
                    checked={formData.show_embed_image}
                    onChange={(e) =>
                      setFormData({ ...formData, show_embed_image: e.target.checked })
                    }
                  />
                  <span>
                    <span className="composer__toggle-title">
                      <Info size={12} />
                      Show image preview from link
                    </span>
                    <span className="composer__toggle-desc">
                      We&apos;ll try to fetch the page&apos;s preview image. If the site doesn&apos;t
                      provide one, your post appears normally.
                    </span>
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="modal__foot">
            <button
              type="button"
              onClick={onClose}
              className="btn btn--secondary"
              disabled={isSubmitting}
            >
              <span className="btn__label">Cancel</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                Cancel
              </span>
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn--primary">
              <span className="btn__label">{isSubmitting ? 'Posting…' : 'Post'}</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                {isSubmitting ? 'Posting…' : 'Post'}
              </span>
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
