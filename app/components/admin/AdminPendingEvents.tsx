'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink, Calendar, Clock } from 'lucide-react';
import { formatDateLong, formatTime } from '@/app/lib/formatDate';
import { toast } from 'sonner';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  form_link: string;
  image_url: string | null;
  created_at: string;
  category: string;
  created_by: string;
}

export default function AdminPendingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPendingEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPendingEvents() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/events/pending');
      if (!response.ok) throw new Error('Failed to fetch events');
      const { events, usernames } = await response.json();
      setEvents(events);
      setUsernames(usernames);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to load pending events');
    } finally {
      setLoading(false);
    }
  }

  async function handleEventAction(id: string, approve: boolean) {
    try {
      setProcessing((prev) => ({ ...prev, [id]: true }));
      const endpoint = approve ? '/api/admin/events/verify' : '/api/events/remove';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id }),
      });
      if (!response.ok) {
        throw new Error(approve ? 'Failed to verify event' : 'Failed to remove event');
      }
      toast.success(approve ? 'Event approved' : 'Event removed');
      setEvents(events.filter((event) => event.id !== id));
    } catch (err) {
      console.error('Error:', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No pending events.</p>
        <p className="empty-state__desc">Every submitted event has been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="admin-pending">
      {events.map((event) => (
        <article key={event.id} className="admin-pending__card">
          <div className="admin-pending__layout">
            <div className="admin-pending__media">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 192px"
                  className="admin-pending__img"
                />
              ) : (
                <span className="admin-pending__no-img">No image</span>
              )}
            </div>

            <div className="admin-pending__body">
              <div className="admin-pending__badges">
                <span className="tag" style={{ '--c': 'var(--m)' } as React.CSSProperties}>
                  {event.category}
                </span>
                <span className="admin-pending__by">
                  by {usernames[event.created_by] || 'Unknown user'}
                </span>
              </div>

              <h3 className="admin-pending__title">{event.title}</h3>

              <div className="admin-pending__meta">
                <span className="admin-pending__meta-item">
                  <Calendar size={14} />
                  {formatDateLong(event.event_date)}
                </span>
                <span className="admin-pending__meta-item">
                  <Clock size={14} />
                  {formatTime(event.event_date)}
                </span>
              </div>

              <p className="admin-pending__desc">{event.description}</p>

              <a
                href={event.form_link}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-pending__link"
              >
                <ExternalLink size={14} />
                Open registration form
              </a>
            </div>
          </div>

          <footer className="admin-pending__foot">
            <button
              type="button"
              onClick={() => handleEventAction(event.id, false)}
              disabled={!!processing[event.id]}
              className="btn btn--secondary"
              style={{ color: 'var(--danger)' }}
            >
              <span className="btn__label">
                <XCircle size={14} style={{ marginRight: 8 }} />
                Reject
              </span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                <XCircle size={14} style={{ marginRight: 8 }} />
                Reject
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleEventAction(event.id, true)}
              disabled={!!processing[event.id]}
              className="btn btn--primary"
            >
              <span className="btn__label">
                <CheckCircle size={14} style={{ marginRight: 8 }} />
                Approve
              </span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                <CheckCircle size={14} style={{ marginRight: 8 }} />
                Approve
              </span>
            </button>
          </footer>
        </article>
      ))}
    </div>
  );
}
