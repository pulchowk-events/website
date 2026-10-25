'use client';

import { useState, useEffect } from 'react';
import { Pencil, Edit2 } from 'lucide-react';
import EditEventModal from './EditEventModal';

type EventCategory = 'all' | 'software' | 'gaming' | 'hardware' | 'music' | 'sports' | 'extra';

interface EditEventButtonProps {
  event: {
    id: string;
    title: string;
    description: string;
    event_date: string;
    form_link: string;
    image_url: string | null;
    category: Exclude<EventCategory, 'all'>;
    created_by: string;
  };
}

export default function EditEventButton({ event }: EditEventButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Frosted trigger — sits on image overlay in EventCard */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-md backdrop-blur-sm transition-all duration-200 border border-white/5 shadow-sm group"
        aria-label="Edit event"
      >
        <Edit2 className="w-3.5 h-3.5 text-white/90 group-hover:text-white" />
        {!isMobile && (
          <span className="text-xs font-medium">Edit</span>
        )}
      </button>

      {isModalOpen && (
        <EditEventModal
          event={event}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}