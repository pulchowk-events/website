'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface EditProductModalProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
    image_url: string | null;
    redirect_url: string | null;
  };
  onClose: () => void;
}

export default function EditProductModal({ product, onClose }: EditProductModalProps) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [url, setUrl] = useState(product.url);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState(product.redirect_url || '');

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

      const response = await fetch('/api/products/' + product.id, {
        method: 'PUT',
        body: formData,
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) throw new Error(data.error || 'Failed to update product');
      if (!data.success) throw new Error('Update operation failed');

      toast.success('Project updated');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
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
            <h2 className="modal__title">Edit project</h2>
            <p style={{ fontSize: 13, color: 'var(--m)', marginTop: 4 }}>
              Update your project details.
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
              <label htmlFor="edit-name" className="field__label">
                Project name <span className="field__label-req">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <label htmlFor="edit-description" className="field__label">
                Description <span className="field__label-req">*</span>
              </label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input input--multi"
                rows={3}
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <label htmlFor="edit-url" className="field__label">
                URL slug <span className="field__label-req">*</span>
              </label>
              <input
                id="edit-url"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (urlError) setUrlError('');
                }}
                className="input"
                required
                disabled={loading}
                aria-invalid={!!urlError}
              />
              {urlError && <p className="field__error">{urlError}</p>}
            </div>

            <div className="field">
              <label htmlFor="edit-redirect-url" className="field__label">
                Live URL <span style={{ color: 'var(--m)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="edit-redirect-url"
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://your-project.com"
                className="input"
                disabled={loading}
              />
            </div>

            <div className="field">
              <label htmlFor="edit-product-image" className="field__label">
                Replace image <span style={{ color: 'var(--m)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="edit-product-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                className="input input--file"
                disabled={loading}
              />
              {image ? (
                <p className="field__hint">Selected: {image.name}</p>
              ) : product.image_url ? (
                <p className="field__hint">Current image will be kept.</p>
              ) : null}
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
              <span className="btn__label">{loading ? 'Updating…' : 'Update'}</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                {loading ? 'Updating…' : 'Update'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
