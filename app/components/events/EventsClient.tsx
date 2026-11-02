'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, Code, LucideCircuitBoard, Gamepad, Music, Dumbbell, Plus,
} from 'lucide-react';
import EventCard from './EventCard';
import Pagination from './Pagination';

type EventCategory =
  | 'all'
  | 'software'
  | 'gaming'
  | 'hardware'
  | 'music'
  | 'sports'
  | 'extra';

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
  created_at: string;
  category: Exclude<EventCategory, 'all'>;
  created_by: string;
  origin?: string | null;
  location?: string | null;
  price?: string | null;
  organizer?: string | null;
  source_url?: string | null;
  attendance_mode?: string | null;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
}

interface EventsClientProps {
  events: Event[];
  totalCount: number;
  page: number;
  pageSize: number;
  tab: 'upcoming' | 'past';
  category: string;
  isAdmin: boolean;
}

function buildUrl(params: {
  tab?: 'upcoming' | 'past';
  category?: string;
  page?: number;
}): string {
  const url = new URLSearchParams();
  if (params.tab && params.tab !== 'upcoming') url.set('tab', params.tab);
  if (params.category && params.category !== 'all') url.set('category', params.category);
  if (params.page && params.page > 1) url.set('page', String(params.page));
  const qs = url.toString();
  return `/events${qs ? `?${qs}` : ''}`;
}

export default function EventsClient({
  events,
  totalCount,
  page,
  pageSize,
  tab,
  category,
  isAdmin,
}: EventsClientProps) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      {/* Header + tab switcher */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-foreground">
            {tab === 'past' ? 'Past Events' : 'Upcoming Events'}
          </h2>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing {from}–{to} of {totalCount}
              {category !== 'all' ? ` ${category}` : ''} event{totalCount === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-full">
          <Link
            href={buildUrl({ tab: 'upcoming', category, page: 1 })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              tab === 'upcoming'
                ? 'bg-green-600 text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-current={tab === 'upcoming' ? 'page' : undefined}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Upcoming</span>
          </Link>
          <Link
            href={buildUrl({ tab: 'past', category, page: 1 })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              tab === 'past'
                ? 'bg-green-600 text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-current={tab === 'past' ? 'page' : undefined}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Past</span>
          </Link>
        </div>
      </div>

      {/* Category tabs — URL-driven, each is indexable */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        {categories.map(({ value, label, icon: Icon }) => {
          const active = category === value;
          return (
            <Link
              key={value}
              href={buildUrl({ tab, category: value, page: 1 })}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-green-600 text-white'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Events grid */}
      <div>
        <motion.div
          key={`${tab}-${category}-${page}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={tab === 'past'}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                buildUrl={(p) => buildUrl({ tab, category, page: p })}
              />
            </>
          ) : (
            <div className="text-center py-12 bg-card/50 border border-border rounded-xl">
              <p className="text-muted-foreground">
                {tab === 'past'
                  ? `No past ${category !== 'all' ? category + ' ' : ''}events to show`
                  : `No upcoming ${category !== 'all' ? category + ' ' : ''}events scheduled`}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}