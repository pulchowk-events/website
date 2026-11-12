'use client';

import Image from 'next/image';
import { formatDateTime, formatRelativeDay } from '@/app/lib/formatDate';
import Link from 'next/link';
import DeleteButton from './DeleteButton';
import {
  Code, LucideCircuitBoard, Gamepad, Music, Dumbbell, Plus,
  Calendar, MapPin, Building2, DollarSign,
} from 'lucide-react';
import EditEventButton from './EditEventButton';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  form_link: string;
  image_url: string | null;
  created_at: string;
  category: keyof typeof categoryIcons;
  created_by: string;
  origin?: string | null;
  location?: string | null;
  price?: string | null;
  organizer?: string | null;
  source_url?: string | null;
  attendance_mode?: string | null;
  author?: { id: string; name?: string | null; image?: string | null } | null;
}

const categoryIcons = {
  software: Code,
  gaming: Gamepad,
  music: Music,
  hardware: LucideCircuitBoard,
  sports: Dumbbell,
  extra: Plus,
} as const;

const categoryColors = {
  software: 'var(--c)',
  hardware: 'var(--a)',
  gaming: 'var(--v)',
  music: '#ff6b9d',
  sports: 'var(--g)',
  extra: 'var(--m)',
} as const;

const SOURCE_LABELS: Record<string, string> = {
  khalti: 'Khalti',
  katajaam: 'KataJaam',
  nepvents: 'NepVents',
  kgarira: 'Kgarira',
};

function formatSourceBadge(origin: string | null | undefined): string | null {
  if (!origin || origin === 'user') return null;
  if (origin.startsWith('scraper:')) {
    const key = origin.slice('scraper:'.length);
    return SOURCE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }
  return null;
}

export default function EventCard({
  event, isPast = false, isAdmin = false, userId,
}: {
  event: Event; isPast?: boolean; isAdmin?: boolean; userId?: string;
}) {
  const eventDate = new Date(event.event_date);
  const CategoryIcon = categoryIcons[event.category] || Plus;
  const catColor = categoryColors[event.category] || categoryColors.extra;
  const isBotEvent = event.origin?.startsWith('scraper:') || false;
  const sourceLabel = formatSourceBadge(event.origin);
  const authorName = event.author?.name || 'Anonymous';
  const authorImage = event.author?.image || '/default-avatar.png';

  return (
    <article className="event-card">
      {!isBotEvent && (isAdmin || event.created_by === userId) && (
        <div className="event-card__actions">
          <EditEventButton event={event} />
          <DeleteButton eventId={event.id} onSuccess={() => window.location.reload()} />
        </div>
      )}

      <Link href={'/events/' + event.id} className="event-card__link">
        <div className="event-card__media">
          {event.image_url ? (
            <>
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="event-card__img"
              />
              <div className="event-card__scrim" aria-hidden="true" />
            </>
          ) : (
            <div className="event-card__fallback" aria-hidden="true">
              <CategoryIcon size={56} />
            </div>
          )}

          <div className="event-card__badges">
            <span
              className="tag tag--cat"
              style={{ '--c': catColor } as React.CSSProperties}
            >
              <CategoryIcon size={12} />
              <span>{event.category}</span>
            </span>
            {isBotEvent && sourceLabel && (
              <span className="event-card__source">via {sourceLabel}</span>
            )}
          </div>

          <div className="event-card__status">
            <span
              className="tag"
              style={{ '--c': isPast ? 'var(--danger)' : 'var(--g)' } as React.CSSProperties}
            >
              {isPast ? 'Past event' : formatRelativeDay(eventDate)}
            </span>
          </div>
        </div>

        <div className="event-card__body">
          <h3 className="event-card__title">{event.title}</h3>

          <p className="event-card__meta">
            <Calendar size={14} />
            <span>{formatDateTime(eventDate)}</span>
          </p>

          {(event.location || (event.price && event.price !== 'Free')) && (
            <p className="event-card__meta event-card__meta--row">
              {event.location && (
                <span className="event-card__inline">
                  <MapPin size={14} />
                  <span className="event-card__truncate">{event.location}</span>
                </span>
              )}
              {event.price && event.price !== 'Free' && (
                <span className="event-card__inline">
                  <DollarSign size={14} />
                  <span>{event.price}</span>
                </span>
              )}
            </p>
          )}

          {event.organizer && (
            <p className="event-card__meta">
              <Building2 size={14} />
              <span className="event-card__truncate">{event.organizer}</span>
            </p>
          )}

          <p className="event-card__desc">
            {event.description.length > 150
              ? event.description.slice(0, 150) + '...'
              : event.description}
          </p>

          <footer className="event-card__foot">
            <div className="event-card__avatar">
              <Image
                src={authorImage}
                alt={authorName}
                fill
                sizes="28px"
                className="event-card__avatar-img"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
              />
            </div>
            <div className="event-card__author">
              <span className="event-card__author-label">
                {isBotEvent ? 'Curated by' : 'Created by'}
              </span>
              <span className="event-card__author-name">{authorName}</span>
            </div>
          </footer>
        </div>
      </Link>
    </article>
  );
}
