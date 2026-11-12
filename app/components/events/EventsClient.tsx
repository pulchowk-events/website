'use client';

import Link from 'next/link';
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
  { value: 'all', label: 'All', icon: Calendar },
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
  return '/events' + (qs ? '?' + qs : '');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="events-toolbar">
        <div>
          <h2 className="events-toolbar__title">
            {tab === 'past' ? 'Past events' : 'Upcoming events'}
          </h2>
          {totalCount > 0 && (
            <p className="events-toolbar__meta">
              Showing {from}–{to} of {totalCount}
              {category !== 'all' ? ' ' + category : ''} event{totalCount === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <div className="tabs" role="tablist" aria-label="Time range">
          <Link
            href={buildUrl({ tab: 'upcoming', category, page: 1 })}
            className={'tab' + (tab === 'upcoming' ? ' tab--on' : '')}
            aria-current={tab === 'upcoming' ? 'page' : undefined}
          >
            <Calendar size={14} />
            <span>Upcoming</span>
          </Link>
          <Link
            href={buildUrl({ tab: 'past', category, page: 1 })}
            className={'tab' + (tab === 'past' ? ' tab--on' : '')}
            aria-current={tab === 'past' ? 'page' : undefined}
          >
            <Clock size={14} />
            <span>Past</span>
          </Link>
        </div>
      </div>

      <div className="tabs" aria-label="Categories">
        {categories.map(({ value, label, icon: Icon }) => {
          const active = category === value;
          return (
            <Link
              key={value}
              href={buildUrl({ tab, category: value, page: 1 })}
              className={'tab' + (active ? ' tab--on' : '')}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={14} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      <div key={tab + '-' + category + '-' + page} className="events-fade">
        {events.length > 0 ? (
          <>
            <div className="events-grid">
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
          <div className="empty-state">
            <p className="empty-state__title">
              {tab === 'past'
                ? 'No past' + (category !== 'all' ? ' ' + category : '') + ' events'
                : 'No upcoming' + (category !== 'all' ? ' ' + category : '') + ' events'}
            </p>
            <p className="empty-state__desc">
              {tab === 'past'
                ? 'Try a different category.'
                : 'Check back soon, or submit the first one.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
