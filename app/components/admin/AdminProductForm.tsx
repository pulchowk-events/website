'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminProductForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', url: '' });
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.url) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('url', formData.url);
      if (image) formDataToSend.append('image', image);

      const response = await fetch('/api/products/submit', {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add product');
      toast.success('Project added');
      setFormData({ name: '', description: '', url: '' });
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
          <label htmlFor="name" className="field__label">
            Project name <span className="field__label-req">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="input"
            required
            disabled={loading}
          />
        </div>
        <div className="field">
          <label htmlFor="url" className="field__label">
            URL slug <span className="field__label-req">*</span>
          </label>
          <input
            id="url"
            name="url"
            type="text"
            value={formData.url}
            onChange={handleChange}
            className="input"
            required
            disabled={loading}
          />
        </div>
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

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={loading} className="btn btn--primary">
          <span className="btn__label">{loading ? 'Adding…' : 'Add project'}</span>
          <span className="btn__label btn__label--dup" aria-hidden="true">
            {loading ? 'Adding…' : 'Add project'}
          </span>
        </button>
      </div>
    </form>
  );
}
