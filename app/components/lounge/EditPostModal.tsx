'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { X, Link as LinkIcon, Image as ImageIcon, Info, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';
import { MarkdownEditor } from '@/app/components/ui/MarkdownEditor';

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
  const [descMode, setDescMode] = useState<'write' | 'preview'>('write');
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
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/lounge/posts/' + post.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update post');

      toast.success('Post updated');
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
    <Dialog open={true} onClose={onClose} className="modal-backdrop">
      <Dialog.Panel className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <header className="modal__head">
          <Dialog.Title className="modal__title">Edit post</Dialog.Title>
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
            <input
              type="text"
              placeholder="Post title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />

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

            <MarkdownEditor
              value={formData.content}
              onChange={(v) => setFormData({ ...formData, content: v })}
              mode={descMode}
              onModeChange={setDescMode}
              minHeight={260}
              placeholder="Write your post… Markdown supported."
            />

            {hasImage && (
              <div className="composer__toggle" style={{ cursor: 'default' }}>
                <div style={{ flex: 1 }}>
                  <div className="composer__toggle-title" style={{ marginBottom: 8 }}>
                    <ImageIcon size={12} />
                    Current image
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="composer__toggle-title"
                      style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: 0,
                        padding: 0,
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        fontWeight: 500,
                        gap: 4,
                      }}
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                  <div className="composer__preview">
                    <Image
                      src={post.image_url!}
                      alt="Current post image"
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 480px"
                      className="composer__preview-img"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="composer__url">
              <LinkIcon size={14} />
              <input
                type="url"
                placeholder="Reference link (optional)"
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
                    {!formData.show_embed_image && post.image_url
                      ? 'Image will be removed when you save.'
                      : formData.redirect_url !== (post.redirect_url || '')
                        ? 'Changing the link will refresh the preview image.'
                        : "We'll try to fetch the page's preview image."}
                  </span>
                </span>
              </label>
            )}
          </div>

          <div className="modal__foot">
            <button
              type="button"
              onClick={onClose}
              className="btn btn--secondary"
              disabled={isSubmitting}
            >
              <span className="btn__label">Cancel</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">Cancel</span>
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn--primary">
              <span className="btn__label">{isSubmitting ? 'Updating…' : 'Update post'}</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                {isSubmitting ? 'Updating…' : 'Update post'}
              </span>
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
