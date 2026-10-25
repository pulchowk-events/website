'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
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
  }, []);

  async function fetchPendingEvents() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/events/pending');

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

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
      setProcessing(prev => ({ ...prev, [id]: true }));

      const endpoint = approve ? '/api/admin/events/verify' : '/api/events/remove';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: id }),
      });

      if (!response.ok) {
        throw new Error(approve ? 'Failed to verify event' : 'Failed to remove event');
      }

      toast.success(
        approve
          ? 'Event verified successfully'
          : 'Event removed successfully'
      );

      setEvents(events.filter(event => event.id !== id));
    } catch (err) {
      console.error('Error:', err);
      toast.error(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      );
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground">No pending events</h3>
        <p className="text-muted-foreground mt-2">All events have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {events.map((event) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-card/50 rounded-lg overflow-hidden border border-border"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 flex-shrink-0">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    width={192}
                    height={192}
                    className="rounded-lg object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
              </div>

              <div className="flex-grow space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                      {event.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by {usernames[event.created_by] || 'Unknown user'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(event.event_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(event.event_date), 'p')}</span>
                  </div>
                </div>

                <p className="text-foreground">{event.description}</p>

                <div className="flex items-center gap-4">
                  <a
                    href={event.form_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Registration Form
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => handleEventAction(event.id, true)}
                disabled={!!processing[event.id]}
                className="p-2 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="h-6 w-6" />
              </button>
              <button
                onClick={() => handleEventAction(event.id, false)}
                disabled={!!processing[event.id]}
                className="p-2 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 disabled:opacity-50 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}