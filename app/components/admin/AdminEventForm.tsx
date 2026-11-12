'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminEventForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    formLink: '',
  });
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        toast.error('Image must be less than 1MB');
        return;
      }
      setImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.eventDate || !formData.formLink) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('eventDate', formData.eventDate);
      formDataToSend.append('formLink', formData.formLink);
      if (image instanceof File) {
        formDataToSend.append('image', image, image.name);
      }

      const response = await fetch('/api/events/submit', {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add event');

      toast.success('Event added');
      setFormData({ title: '', description: '', eventDate: '', formLink: '' });
      setImage(null);
    } catch (err) {
      console.error('Error:', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form__row">
        <div className="field">
          <label htmlFor="title" className="field__label">
            Event title <span className="field__label-req">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="input"
            required
            disabled={loading}
          />
        </div>
        <div className="field">
          <label htmlFor="eventDate" className="field__label">
            Event date <span className="field__label-req">*</span>
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="datetime-local"
            value={formData.eventDate}
            onChange={handleChange}
            className="input"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="formLink" className="field__label">
          Registration form link <span className="field__label-req">*</span>
        </label>
        <input
          id="formLink"
          name="formLink"
          type="url"
          value={formData.formLink}
          onChange={handleChange}
          className="input"
          required
          disabled={loading}
        />
      </div>

      <div className="field">
        <label htmlFor="description" className="field__label">
          Description <span className="field__label-req">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="input input--multi"
          required
          disabled={loading}
        />
      </div>

      <div className="field">
        <label htmlFor="event-image" className="field__label">
          Image <span style={{ color: 'var(--m)', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          id="event-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="input input--file"
          disabled={loading}
        />
        {image && <p className="field__hint">Selected: {image.name}</p>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={loading} className="btn btn--primary">
          <span className="btn__label">{loading ? 'Adding…' : 'Add event'}</span>
          <span className="btn__label btn__label--dup" aria-hidden="true">
            {loading ? 'Adding…' : 'Add event'}
          </span>
        </button>
      </div>
    </form>
  );
}
