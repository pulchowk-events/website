'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Code, LucideCircuitBoard, Gamepad, Music, Dumbbell, Plus } from 'lucide-react';
import EventCard from './EventCard';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type EventCategory = 'all' | 'software' | 'gaming' | 'hardware' | 'music' | 'sports' | 'extra';

const categories = [
  { value: 'all', label: 'All Events', icon: Calendar },
  { value: 'software', label: 'Software', icon: Code },
  { value: 'hardware', label: 'Hardware', icon: LucideCircuitBoard },
  { value: 'gaming', label: 'Gaming', icon: Gamepad },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'sports', label: 'Sports', icon: Dumbbell },
  { value: 'extra', label: 'Extra', icon: Plus },
] as const;

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  form_link: string;
  image_url: string | null;
  created_by: string;
  created_at: string;
  category: Exclude<EventCategory, 'all'>;
}

interface EventsClientProps {
  upcomingEvents: Event[];
  pastEvents: Event[];
  isAdmin: boolean;
}

export default function EventsClient({ upcomingEvents, pastEvents, isAdmin }: EventsClientProps) {
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all');

  const filterEventsByCategory = (events: Event[]) => {
    if (selectedCategory === 'all') return events;
    return events.filter(event => event.category === selectedCategory);
  };

  const events = filterEventsByCategory(showPastEvents ? pastEvents : upcomingEvents);

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-medium text-white">
          {showPastEvents ? 'Recent Events' : 'Upcoming Events'}
        </h2>
        
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full">
          <button
            onClick={() => setShowPastEvents(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              !showPastEvents 
                ? 'bg-green-600 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Upcoming</span>
          </button>
          <button
            onClick={() => setShowPastEvents(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              showPastEvents 
                ? 'bg-green-600 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Past</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <Tabs 
          defaultValue="all" 
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as EventCategory)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-7 gap-2 bg-transparent">
            {categories.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 data-[state=active]:bg-green-600 bg-white/5 hover:bg-white/10"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Events Grid */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${showPastEvents}-${selectedCategory}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={showPastEvents}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <p className="text-zinc-400">
                  {showPastEvents 
                    ? `No past ${selectedCategory !== 'all' ? selectedCategory : ''} events to show`
                    : `No upcoming ${selectedCategory !== 'all' ? selectedCategory : ''} events scheduled`
                  }
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}