'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EventCategory = 'software' | 'gaming' | 'hardware' | 'music' | 'sports' | 'extra';

const categories = [
  { value: 'software', label: 'Software' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'extra', label: 'Extra' }
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

export default function EditEventModal({ event, onClose }: EditEventModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: event.id,
    title: event.title,
    description: event.description,
    eventDate: new Date(event.event_date).toISOString().slice(0, 16),
    formLink: event.form_link,
    category: event.category
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

// Update the handleSubmit function
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('eventDate', formData.eventDate);
    formDataToSend.append('formLink', formData.formLink);
    formDataToSend.append('category', formData.category);
    if (image) {
      formDataToSend.append('image', image);
    }

    const response = await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      body: formDataToSend,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update event');
    }

    toast.success('Event updated successfully!');
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999999] min-h-screen flex items-center justify-center bg-black/50 px-4 sm:px-0"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative w-full bg-black text-white overflow-hidden">
            <CardHeader>
              <CardTitle>Edit Event</CardTitle>
              <CardDescription>Update event details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 space-x-4 grid  grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                    className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="formLink">Registration Form Link</Label>
                  <Input
                    id="formLink"
                    type="url"
                    value={formData.formLink}
                    onChange={(e) => setFormData({ ...formData, formLink: e.target.value })}
                    placeholder="https://"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="image">Update Event Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                  {image && (
                    <p className="text-sm text-zinc-400">Selected: {image.name}</p>
                  )}
                  {event.image_url && !image && (
                    <p className="text-sm text-zinc-400">
                      Current image will be kept
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
            <BorderBeam duration={8} size={120} />
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}