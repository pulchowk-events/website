'use client';

import Image from 'next/image';
import { formatDistanceToNow, format } from 'date-fns';
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
  software: Code, gaming: Gamepad, music: Music,
  hardware: LucideCircuitBoard, sports: Dumbbell, extra: Plus,
} as const;

const categoryColors = {
  software: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  gaming: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
  music: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20',
  hardware: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  sports: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  extra: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
} as const;

const SOURCE_LABELS: Record<string, string> = {
  khalti: 'Khalti', katajaam: 'KataJaam', nepvents: 'NepVents', kgarira: 'Kgarira',
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
  const categoryColor = categoryColors[event.category] || categoryColors.extra;
  const isBotEvent = event.origin?.startsWith('scraper:') || false;
  const sourceLabel = formatSourceBadge(event.origin);
  const authorName = event.author?.name || 'Anonymous';
  const authorImage = event.author?.image || '/default-avatar.png';
  const authorId = event.created_by || 'anonymous';

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full relative group">
      {/* Admin actions — absolutely positioned, OUTSIDE the Link so they don't trigger navigation */}
      {!isBotEvent && (isAdmin || event.created_by === userId) && (
        <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <EditEventButton event={event} />
          <DeleteButton eventId={event.id} onSuccess={() => window.location.reload()} />
        </div>
      )}

      <Link href={`/events/${event.id}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative h-52 w-full bg-muted flex-shrink-0">
          {event.image_url ? (
            <>
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <CategoryIcon className="w-16 h-16 text-muted-foreground/40" />
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border backdrop-blur-lg ${categoryColor}`}>
              <CategoryIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium capitalize">{event.category}</span>
            </div>
          </div>

          {/* Source badge (bot events) */}
          {isBotEvent && sourceLabel && (
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/50 text-white text-xs font-medium border border-white/10 backdrop-blur-md">
                via {sourceLabel}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="absolute bottom-3 left-3">
            {isPast ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500/20 text-red-200 border border-red-500/20 backdrop-blur-sm">
                <span className="text-xs font-medium">Past Event</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500/20 text-green-200 border border-green-500/20 backdrop-blur-sm">
                <span className="text-xs font-medium">{formatDistanceToNow(eventDate, { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {event.title}
          </h3>

          <div className="flex items-center text-muted-foreground text-sm mb-2 gap-1.5">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{format(eventDate, 'PPP')} at {format(eventDate, 'p')}</span>
          </div>

          {(event.location || event.price) && (
            <div className="flex flex-wrap items-center text-muted-foreground text-sm mb-2 gap-x-3 gap-y-1">
              {event.location && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
              {event.price && event.price !== 'Free' && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 flex-shrink-0" />
                  <span>{event.price}</span>
                </div>
              )}
            </div>
          )}

          {event.organizer && (
            <div className="flex items-center text-muted-foreground text-sm mb-4 gap-1.5">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.organizer}</span>
            </div>
          )}

          <p className="text-muted-foreground mb-5 text-sm leading-relaxed line-clamp-3">
            {event.description.length > 150 ? event.description.slice(0, 150) + '...' : event.description}
          </p>

          {/* Author — bottom of card */}
          <div className="mt-auto pt-3 border-t border-border flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={authorImage}
                alt={authorName}
                fill
                sizes="32px"
                className="object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground">
                {isBotEvent ? 'Curated by' : 'Created by'}
              </span>
              <span className="text-sm font-medium text-foreground truncate">{authorName}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}