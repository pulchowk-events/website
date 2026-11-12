'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { MarkdownEditor } from '@/app/components/ui/MarkdownEditor';

type EventCategory = 'software' | 'gaming' | 'hardware' | 'music' | 'sports' | 'extra';

const categories: { value: EventCategory; label: string }[] = [
  { value: 'software', label: 'Software' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'extra', label: 'Extra' },
];

interface EditEventModalProps {
  event: {
    id: string;
    title: string;
    description: string;
    event_date: string;
    form_link: string;
    image_url: string | null;
    category: EventCategory;
  };
  onClose: () => void;
}

function toNepalInputValue(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return get('year') + '-' + get('month') + '-' + get('day') + 'T' + hour + ':' + get('minute');
}

export default function EditEventModal({ event, onClose }: EditEventModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: event.id,
    title: event.title,
    description: event.description,
    eventDate: toNepalInputValue(event.event_date),
    formLink: event.form_link,
    category: event.category,
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [descMode, setDescMode] = useState<'write' | 'preview'>('write');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error('Description is required');
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

      const response = await fetch('/api/events/' + event.id, {
        method: 'PUT',
        body: formDataToSend,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update event');

      toast.success('Event updated');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update event');
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
            <Dialog.Title className="modal__title">Edit event</Dialog.Title>
            <p style={{ fontSize: 13, color: 'var(--m)', marginTop: 4 }}>
              Changes appear on the public page immediately.
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
                  <label htmlFor="edit-ev-title" className="field__label">
                    Title <span className="field__label-req">*</span>
                  </label>
                  <input
                    id="edit-ev-title"
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
                  <label htmlFor="edit-ev-date" className="field__label">
                    Date and time (Nepal) <span className="field__label-req">*</span>
                  </label>
                  <input
                    id="edit-ev-date"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="field">
                  <label htmlFor="edit-ev-link" className="field__label">
                    Registration link <span className="field__label-req">*</span>
                  </label>
                  <input
                    id="edit-ev-link"
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
                  <label htmlFor="edit-ev-image" className="field__label">
                    Replace image <span style={{ color: 'var(--m)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    id="edit-ev-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="input input--file"
                    disabled={loading}
                  />
                  {image ? (
                    <p className="field__hint">Selected: {image.name}</p>
                  ) : event.image_url ? (
                    <p className="field__hint">Current image will be kept.</p>
                  ) : null}
                </div>
              </div>

              <div className="field event-form__desc">
                <span className="field__label">
                  Description <span className="field__label-req">*</span>
                </span>
                <MarkdownEditor
                  value={formData.description}
                  onChange={(v) => setFormData({ ...formData, description: v })}
                  mode={descMode}
                  onModeChange={setDescMode}
                  minHeight={280}
                  placeholder="Write your event description… Markdown supported."
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
              <span className="btn__label">{loading ? 'Updating…' : 'Update event'}</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                {loading ? 'Updating…' : 'Update event'}
              </span>
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
