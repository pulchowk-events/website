'use client';

import Image from 'next/image';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import DeleteButton from './DeleteButton';
import {
  Code,
  LucideCircuitBoard,
  Gamepad,
  Music,
  Dumbbell,
  Plus,
  Calendar,
  ExternalLink,
  MapPin,
  Building2,
  DollarSign,
} from 'lucide-react';
import EditEventButton from './EditEventButton';

interface Author {
  id: string;
  name?: string | null;
  image?: string | null;
}

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
  author?: Author | null;
}

interface EventCardProps {
  event: Event;
  isPast?: boolean;
  isAdmin?: boolean;
  userId?: string;
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
  software:
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  gaming:
    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
  music:
    'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20',
  hardware:
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  sports:
    'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  extra:
    'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
} as const;

// "scraper:khalti" → "Khalti", "scraper:katajaam" → "KataJaam"
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
  event,
  isPast = false,
  isAdmin = false,
  userId,
}: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const formattedDate = format(eventDate, 'PPP');
  const formattedTime = format(eventDate, 'p');
  const timeUntil = formatDistanceToNow(eventDate, { addSuffix: true });

  const CategoryIcon = categoryIcons[event.category] || Plus;
  const categoryColor = categoryColors[event.category] || categoryColors.extra;

  const isBotEvent = event.origin?.startsWith('scraper:') || false;
  const sourceLabel = formatSourceBadge(event.origin);

  const truncateDescription = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const authorName = event.author?.name || 'Anonymous';
  const authorImage = event.author?.image || '/default-avatar.png';
  const authorId = event.created_by || 'anonymous';

  // Comma-free compact meta string builder
  const metaItems: string[] = [];
  if (event.location) metaItems.push(event.location);
  if (event.price && event.price !== 'Free') metaItems.push(event.price);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full relative group">
      {/* Image section */}
      <div className="relative h-52 w-full">
        {event.image_url ? (
          <>
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          </>
        ) : (
          <div className="bg-muted h-full w-full flex items-center justify-center">
            <CategoryIcon className="w-16 h-16 text-muted-foreground/40" />
          </div>
        )}

        {/* Category badge — top-left */}
        <div className="absolute top-3 left-3 z-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border backdrop-blur-lg ${categoryColor}`}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium capitalize">{event.category}</span>
          </div>
        </div>

        {/* Top-right: source badge for bot events, admin actions for user events */}
        <div className="absolute top-3 right-3 z-10">
          {isBotEvent && sourceLabel ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 text-white text-xs font-medium border border-white/10 backdrop-blur-md">
              via {sourceLabel}
            </div>
          ) : (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {(isAdmin || event.created_by === userId) && (
                <>
                  <EditEventButton event={event} />
                  <DeleteButton
                    eventId={event.id}
                    onSuccess={() => window.location.reload()}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* Status badge — bottom-left */}
        <div className="absolute bottom-3 left-3">
          {isPast ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/20 backdrop-blur-sm">
              <span className="text-xs font-medium">Past Event</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/20 backdrop-blur-sm">
              <span className="text-xs font-medium">{timeUntil}</span>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-grow">
        <Link href={`/events/${event.id}`}>
          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            {event.title}
          </h3>
        </Link>

        <div className="flex items-center text-muted-foreground text-sm mb-2 gap-1.5">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>
            {formattedDate} at {formattedTime}
          </span>
        </div>

        {/* Location / Price meta */}
        {metaItems.length > 0 && (
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
          {truncateDescription(event.description)}
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 mb-4 pt-3 border-t border-border">
          <Link
            href={`/profile/${authorId}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
              <Image
                src={authorImage}
                alt={authorName}
                fill
                sizes="32px"
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-avatar.png';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                {isBotEvent ? 'Curated by' : 'Created by'}
              </span>
              <span className="text-sm font-medium text-foreground">{authorName}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 pt-0 mt-auto">
        {!isPast ? (
          <Link
            href={event.form_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-secondary hover:bg-accent text-secondary-foreground py-2.5 px-4 rounded-lg font-medium text-center transition-all duration-200 border border-border"
          >
            <ExternalLink className="w-4 h-4" />
            Register for Event
          </Link>
        ) : (
          <Link
            href={`/events/${event.id}`}
            className="flex items-center justify-center gap-2 w-full bg-muted text-muted-foreground py-2.5 px-4 rounded-lg font-medium text-center border border-border hover:bg-accent hover:text-foreground transition-all duration-200"
          >
            View Event Details
          </Link>
        )}
      </div>
    </div>
  );
}