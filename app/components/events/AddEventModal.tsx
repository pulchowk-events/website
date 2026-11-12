'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

type EventCategory = 'software' | 'gaming' | 'hardware' | 'music' | 'sports' | 'extra';

const categories: { value: EventCategory; label: string }[] = [
  { value: 'software', label: 'Software' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'extra', label: 'Extra' },
];

interface AddEventModalProps {
  onClose: () => void;
}

export default function AddEventModal({ onClose }: AddEventModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    formLink: '',
    category: 'software' as EventCategory,
  });
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error('Sign in to submit an event');
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('eventDate', formData.eventDate + ':00+05:45');
      formDataToSend.append('formLink', formData.formLink);
      formDataToSend.append('category', formData.category);
      if (image) formDataToSend.append('image', image);

      const response = await fetch('/api/events/submit', {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit event');

      toast.success('Event submitted for review');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="modal-backdrop">
      <Dialog.Panel
        className="modal modal--wide"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <header className="modal__head">
          <div>
            <Dialog.Title className="modal__title">Add event</Dialog.Title>
            <p style={{ fontSize: 13, color: 'var(--m)', marginTop: 4 }}>
              Submitted events go through review before appearing on the calendar.
            </p>
          </div>
          <button type="button" onClick={onClose} className="modal__close" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="event-form__grid">
              <div className="event-form__col">
                <div className="field">
                  <label htmlFor="ev-title" className="field__label">
                    Title <span className="field__label-req">*</span>
                  </label>
                  <input
                    id="ev-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="field">
                  <span className="field__label">
                    Category <span className="field__label-req">*</span>
                  </span>
                  <div className="tabs" role="tablist" aria-label="Category">
                    {categories.map((c) => (
                      <button
                        type="button"
                        key={c.value}
                        role="tab"
                        aria-selected={formData.category === c.value}
                        className={'tab' + (formData.category === c.value ? ' tab--on' : '')}
                        onClick={() => setFormData({ ...formData, category: c.value })}
                        disabled={loading}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="ev-date" className="field__label">
                    Date and time (Nepal) <span className="field__label-req">*</span>
                  </label>
                  <input
                    id="ev-date"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="field">
                  <label htmlFor="ev-link" className="field__label">
                    Registration link <span className="field__label-req">*</span>
                  </label>
                  <input
                    id="ev-link"
                    type="url"
                    value={formData.formLink}
                    onChange={(e) => setFormData({ ...formData, formLink: e.target.value })}
                    className="input"
                    placeholder="https://"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="field">
                  <label htmlFor="ev-image" className="field__label">
                    Image <span style={{ color: 'var(--m)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    id="ev-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="input input--file"
                    disabled={loading}
                  />
                  {image && <p className="field__hint">Selected: {image.name}</p>}
                </div>
              </div>

              <div className="field event-form__desc">
                <label htmlFor="ev-desc" className="field__label">
                  Description <span className="field__label-req">*</span>
                </label>
                <textarea
                  id="ev-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input input--multi"
                  style={{ minHeight: 320 }}
                  required
                  disabled={loading}
                />
              </div>
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
              <span className="btn__label">{loading ? 'Submitting…' : 'Submit event'}</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                {loading ? 'Submitting…' : 'Submit event'}
              </span>
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
