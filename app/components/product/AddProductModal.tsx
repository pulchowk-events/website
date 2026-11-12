'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { MarkdownEditor } from '@/app/components/ui/MarkdownEditor';

interface AddProductModalProps {
  onClose: () => void;
}

export default function AddProductModal({ onClose }: AddProductModalProps) {
  const { data: session } = useSession();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [descMode, setDescMode] = useState<'write' | 'preview'>('write');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, loading]);

  const validateUrl = (value: string) => {
    const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!regex.test(value)) return 'Slug must use lowercase letters and hyphens only.';
    return '';
  };

  const validateRedirectUrl = (value: string) => {
    if (!value) return '';
    try {
      new URL(value);
      return '';
    } catch {
      return 'Enter a valid URL (including http:// or https://)';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error('Sign in to submit a project.');
      signIn();
      return;
    }

    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    const errorMsg = validateUrl(url);
    if (errorMsg) {
      setUrlError(errorMsg);
      return;
    }

    const redirectError = validateRedirectUrl(redirectUrl);
    if (redirectError) {
      toast.error(redirectError);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('url', url);
      formData.append('redirect_url', redirectUrl);
      if (image) formData.append('image', image);

      const response = await fetch('/api/products/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit product');

      toast.success(result.message || 'Project submitted for review');
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <div>
            <h2 className="modal__title">Submit a project</h2>
            <p style={{ fontSize: 13, color: 'var(--m)', marginTop: 4 }}>
              Goes through review before appearing on the leaderboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal__close"
            aria-label="Close"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="field">
              <label htmlFor="name" className="field__label">
                Project name <span className="field__label-req">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your project name"
                className="input"
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <span className="field__label">
                Description <span className="field__label-req">*</span>
              </span>
              <MarkdownEditor
                value={description}
                onChange={setDescription}
                mode={descMode}
                onModeChange={setDescMode}
                maxLength={2000}
                minHeight={100}
                placeholder="What does it do, and who is it for?"
              />
            </div>

            <div className="field">
              <label htmlFor="url" className="field__label">
                URL slug <span className="field__label-req">*</span>
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (urlError) setUrlError('');
                }}
                placeholder="my-project-name"
                className="input"
                required
                disabled={loading}
                aria-invalid={!!urlError}
              />
              {urlError ? (
                <p className="field__error">{urlError}</p>
              ) : (
                <p className="field__hint">
                  Lives at <span style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>/product-hunt/{url || 'your-slug'}</span>
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="redirect-url" className="field__label">
                Live URL <span style={{ color: 'var(--m)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="redirect-url"
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://your-project.com"
                className="input"
                disabled={loading}
              />
              <p className="field__hint">Link to your project&apos;s website or repository.</p>
            </div>

            <div className="field">
              <label htmlFor="product-image" className="field__label">
                Image <span style={{ color: 'var(--m)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                className="input input--file"
                disabled={loading}
              />
              {image && <p className="field__hint">Selected: {image.name}</p>}
            </div>
          </div>

          <div className="modal__foot">
            <button
              type="button"
              onClick={onClose}
              className="btn btn--secondary"
              disabled={loading}
            >
              <span className="btn__label">Cancel</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">Cancel</span>
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              <span className="btn__label">{loading ? 'Submitting…' : 'Submit'}</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                {loading ? 'Submitting…' : 'Submit'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
