'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

const EVERYONE_TRIGGER_ID = "e0f8d3b7-5d2a-4c91-9e4a-f23c4b79d2e8-trigger";

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
          type: 'broadcast'
        })
      });

      if (!triggerResponse.ok) {
        throw new Error('Failed to initiate broadcast');
      }

      toast.success('Notification broadcast successfully!');
      setTitle('');
      setLink('');
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error('Failed to broadcast notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-card/50 rounded-lg border border-border ">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
        <h3 className="text-lg text-foreground font-semibold">Broadcast Notification</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-foreground text-sm font-medium mb-1">
            Notification Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-background border border-border text-foreground rounded-md"
            placeholder="Enter notification title"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-foreground font-medium mb-1">
            Link (optional)
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full p-2 bg-background text-foreground border border-border rounded-md"
            placeholder="Enter destination link"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Broadcasting...' : 'Broadcast to Everyone'}
        </button>
      </form>
    </div>
  );
}