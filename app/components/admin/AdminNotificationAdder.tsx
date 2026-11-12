'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, Bell } from 'lucide-react';

const EVERYONE_TRIGGER_ID = 'e0f8d3b7-5d2a-4c91-9e4a-f23c4b79d2e8-trigger';

export default function AdminNotificationAdder() {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const triggerResponse = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: EVERYONE_TRIGGER_ID,
          title,
          link,
          type: 'broadcast',
        }),
      });

      const data = await triggerResponse.json().catch(() => ({}));
      if (!triggerResponse.ok) {
        throw new Error(data.error || 'Failed to broadcast notification');
      }

      toast.success('Notification sent to every user');
      setTitle('');
      setLink('');
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to broadcast notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-notice">
        <AlertCircle size={16} />
        <div>
          <p className="admin-notice__title">Sends to every user.</p>
          <p className="admin-notice__text">
            This notification appears in the bell menu for everyone who has an account.
            There is no undo — you can only mark it read.
          </p>
        </div>
      </div>

      <div className="field">
        <label htmlFor="notif-title" className="field__label">
          Title <span className="field__label-req">*</span>
        </label>
        <input
          id="notif-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="What do you want every user to see?"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="field">
        <label htmlFor="notif-link" className="field__label">
          Link <span style={{ color: 'var(--m)', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          id="notif-link"
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="input"
          placeholder="/events or https://…"
          disabled={isSubmitting}
        />
        <p className="field__hint">
          Where the notification takes the user when they tap it.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={isSubmitting || !title}
          className="btn btn--primary"
          style={{ background: 'var(--a)', color: '#000' }}
        >
          <span className="btn__label">
            <Bell size={14} style={{ marginRight: 8 }} />
            {isSubmitting ? 'Broadcasting…' : 'Broadcast to everyone'}
          </span>
          <span className="btn__label btn__label--dup" aria-hidden="true">
            <Bell size={14} style={{ marginRight: 8 }} />
            {isSubmitting ? 'Broadcasting…' : 'Broadcast to everyone'}
          </span>
        </button>
      </div>
    </form>
  );
}
