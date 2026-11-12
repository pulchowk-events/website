'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ReportModalProps {
  postId: string;
  postTitle: string;
  onClose: () => void;
}

const reportTypes = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
] as const;

type ReportType = typeof reportTypes[number]['value'];

export default function ReportModal({ postId, postTitle, onClose }: ReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '' as ReportType,
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/lounge/posts/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          type: formData.type,
          reason: formData.reason,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit report');

      toast.success('Report submitted');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="modal-backdrop">
      <Dialog.Panel
        className="modal"
        style={{ maxWidth: 480 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <header className="modal__head">
          <Dialog.Title
            className="modal__title"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <AlertTriangle size={16} style={{ color: 'var(--a)' }} />
            Report post
          </Dialog.Title>
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
            <div>
              <p className="page-header__eyebrow" style={{ marginBottom: 8 }}>
                Post being reported
              </p>
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--surface-2)',
                  borderRadius: 8,
                  fontSize: 14,
                  color: 'var(--t)',
                  boxShadow: '0 0 0 1px var(--l2)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {postTitle}
              </div>
            </div>

            <div>
              <p className="page-header__eyebrow" style={{ marginBottom: 8 }}>
                Reason
              </p>
              <div className="tabs" role="tablist" aria-label="Report reason">
                {reportTypes.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    role="tab"
                    aria-selected={formData.type === t.value}
                    className={'tab' + (formData.type === t.value ? ' tab--on' : '')}
                    onClick={() => setFormData({ ...formData, type: t.value })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="page-header__eyebrow" style={{ marginBottom: 8 }}>
                Details
              </p>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="input input--multi"
                placeholder="What's wrong with this post?"
                rows={4}
                required
              />
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
              <span className="btn__label btn__label--dup" aria-hidden="true">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.type}
              className="btn btn--primary"
            >
              <span className="btn__label">{isSubmitting ? 'Submitting…' : 'Submit report'}</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                {isSubmitting ? 'Submitting…' : 'Submit report'}
              </span>
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
