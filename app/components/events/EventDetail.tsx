import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  DollarSign,
  ExternalLink,
  Users,
  User as UserIcon,
  Code,
  LucideCircuitBoard,
  Gamepad,
  Music,
  Dumbbell,
  Plus,
} from 'lucide-react';

interface Author {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  form_link: string;
  image_url: string | null;
  created_at: string;
  category: string;
  created_by: string;
  origin?: string | null;
  location?: string | null;
  price?: string | null;
  organizer?: string | null;
  source_url?: string | null;
  attendance_mode?: string | null;
  author?: Author | null;
}

const categoryIcons: Record<string, any> = {
  software: Code,
  gaming: Gamepad,
  music: Music,
  hardware: LucideCircuitBoard,
  sports: Dumbbell,
  extra: Plus,
};

const SOURCE_LABELS: Record<string, string> = {
  khalti: 'Khalti',
  katajaam: 'KataJaam',
  nepvents: 'NepVents',
  kgarira: 'Kgarira',
};

function formatSourceLabel(origin: string | null | undefined): string | null {
  if (!origin || origin === 'user') return null;
  if (origin.startsWith('scraper:')) {
    const key = origin.slice('scraper:'.length);
    return SOURCE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }
  return null;
}

function formatAttendanceMode(mode: string | null | undefined): string | null {
  if (!mode) return null;
  const m = mode.toLowerCase();
  if (m === 'online') return 'Online';
  if (m === 'hybrid') return 'Hybrid';
  if (m === 'in-person' || m === 'in_person' || m === 'offline') return 'In person';
  return mode;
}

export default function EventDetail({ event, isAdmin }: { event: Event; isAdmin: boolean }) {
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const CategoryIcon = categoryIcons[event.category] || Plus;
  const sourceLabel = formatSourceLabel(event.origin);
  const isBotEvent = event.origin?.startsWith('scraper:') || false;
  const attendanceLabel = formatAttendanceMode(event.attendance_mode);

  const authorName = event.author?.name || 'Anonymous';
  const authorImage = event.author?.image || '/default-avatar.png';
  const authorId = event.created_by || 'anonymous';

  return (
    <article className="space-y-6">
      {/* Back link */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {/* Hero image */}
      {event.image_url && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted border border-border">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
          {isPast && (
            <div className="absolute top-4 left-4 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
              Past Event
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-full text-sm font-medium">
            <CategoryIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{event.category}</span>
          </span>
          {sourceLabel && (
            <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium">
              via {sourceLabel}
            </span>
          )}
          {attendanceLabel && (
            <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium">
              {attendanceLabel}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          {event.title}
        </h1>
      </header>

      {/* Info grid */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Date
            </dt>
            <dd className="text-sm text-foreground">
              {format(eventDate, 'EEEE, MMMM d, yyyy')}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Time
            </dt>
            <dd className="text-sm text-foreground">{format(eventDate, 'h:mm a')}</dd>
          </div>

          {event.location && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Location
              </dt>
              <dd className="text-sm text-foreground">{event.location}</dd>
            </div>
          )}

          {event.price && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Price
              </dt>
              <dd className="text-sm text-foreground">{event.price}</dd>
            </div>
          )}

          {event.organizer && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Organizer
              </dt>
              <dd className="text-sm text-foreground">{event.organizer}</dd>
            </div>
          )}

          <div>
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" />
              {isBotEvent ? 'Curated by' : 'Created by'}
            </dt>
            <dd className="text-sm text-foreground">
              <Link href={`/profile/${authorId}`} className="hover:underline">
                {authorName}
              </Link>
            </dd>
          </div>
        </dl>
      </div>

      {/* Description */}
      {event.description && (
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">About this event</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!isPast && event.form_link && (
          <Link
            href={event.form_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Register for Event
          </Link>
        )}
        {event.source_url && (
          <Link
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground py-3 px-6 rounded-lg font-medium transition-colors border border-border"
          >
            <ExternalLink className="w-4 h-4" />
            View Original Listing
          </Link>
        )}
        {isPast && !event.form_link && !event.source_url && (
          <div className="flex-1 text-center py-3 px-6 rounded-lg bg-muted text-muted-foreground border border-border">
            This event has ended
          </div>
        )}
      </div>
    </article>
  );
}