'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';

type EventCategory = 'software' | 'gaming' | 'hardware' | 'music' | 'sports' | 'extra';

const categories: { value: EventCategory; label: string }[] = [
  { value: 'software', label: 'Software' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'extra', label: 'Extra' }
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
    category: 'software' as EventCategory
  });
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error('You must be signed in to submit.');
      return;
    }

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

      const response = await fetch('/api/events/submit', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit event');
      }

      toast.success('Event submitted successfully!');
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
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" aria-hidden="true" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative bg-popover border border-border rounded-xl w-full max-w-5xl shadow-2xl"
        >
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-foreground">
                Add New Event
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mt-1">Submit a new event for verification</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-foreground">Event Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 bg-background border-border text-foreground"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-foreground">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                    className="w-full mt-1 p-2 rounded bg-background border border-border text-foreground"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="eventDate" className="text-foreground">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="mt-1 bg-background border-border text-foreground"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="formLink" className="text-foreground">Registration Form Link</Label>
                  <Input
                    id="formLink"
                    type="url"
                    value={formData.formLink}
                    onChange={(e) => setFormData({ ...formData, formLink: e.target.value })}
                    placeholder="https://"
                    className="mt-1 bg-background border-border text-foreground"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image" className="text-foreground">Event Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="mt-1 bg-background border-border text-foreground"
                  />
                  {image && (
                    <p className="text-sm text-muted-foreground mt-1">Selected: {image.name}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 p-3 rounded bg-background border border-border text-foreground min-h-[330px] resize-none"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="bg-secondary hover:bg-accent border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Submitting...' : 'Submit Event'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </Dialog>
  );
}