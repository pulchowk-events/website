import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft, Calendar, Clock, MapPin, Building2, DollarSign,
  ExternalLink, Code, LucideCircuitBoard, Gamepad, Music, Dumbbell, Plus,
} from 'lucide-react';
import Markdown from '@/app/components/ui/Markdown';

const DISCORD_URL = 'https://discord.gg/cQ5gxusATk';

const categoryIcons: Record<string, any> = {
  software: Code, gaming: Gamepad, music: Music,
  hardware: LucideCircuitBoard, sports: Dumbbell, extra: Plus,
};

const SOURCE_LABELS: Record<string, string> = {
  khalti: 'Khalti', katajaam: 'KataJaam', nepvents: 'NepVents', kgarira: 'Kgarira',
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

export default function EventDetail({
  event,
}: {
  event: {
    id: string; title: string; description: string; event_date: string;
    form_link: string; image_url: string | null; created_at: string;
    category: string; created_by: string;
    origin?: string | null; location?: string | null; price?: string | null;
    organizer?: string | null; source_url?: string | null;
    attendance_mode?: string | null;
    author?: { id: string; name: string | null; image: string | null; email: string | null } | null;
  };
  isAdmin?: boolean;
}) {
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const CategoryIcon = categoryIcons[event.category] || Plus;
  const sourceLabel = formatSourceLabel(event.origin);
  const isBotEvent = event.origin?.startsWith('scraper:') || false;
  const attendanceLabel = formatAttendanceMode(event.attendance_mode);
  const authorName = event.author?.name || 'Anonymous';
  const authorId = event.created_by || 'anonymous';

  // Button logic per requirement:
  // - If source_url and form_link are the SAME → single "Join Discord Server" button
  // - If they're DIFFERENT → "Register for Event" + "View Original Listing"
  // - If only form_link → "Register for Event"
  const sourceUrl = event.source_url;
  const formUrl = event.form_link;
  const linksAreSame = !!(sourceUrl && formUrl && sourceUrl.toLowerCase() === formUrl.toLowerCase());
  const showRegister = !isPast && !!formUrl && !linksAreSame;
  const showDiscord = !isPast && formUrl && linksAreSame;
  const showSource = !!sourceUrl && !linksAreSame;

  return (
    <article className="space-y-6">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {/* Two-column layout: image on left, content on right (stacks on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,320px)_1fr] gap-6 sm:gap-8">
        {/* Image column */}
        <div>
          <div className="relative w-full aspect-square md:aspect-[4/5] rounded-xl overflow-hidden bg-muted border border-border">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <CategoryIcon className="w-20 h-20 text-muted-foreground/40" />
              </div>
            )}
            {isPast && (
              <div className="absolute top-3 left-3 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                Past Event
              </div>
            )}
          </div>
        </div>

        {/* Content column */}
        <div className="space-y-4 min-w-0">
          {/* Badges */}
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

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {event.title}
          </h1>

          {/* Compact info grid */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date
              </dt>
              <dd className="text-foreground">{format(eventDate, 'EEEE, MMMM d, yyyy')}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Time
              </dt>
              <dd className="text-foreground">{format(eventDate, 'h:mm a')}</dd>
            </div>
            {event.location && (
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </dt>
                <dd className="text-foreground">{event.location}</dd>
              </div>
            )}
            {event.price && (
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Price
                </dt>
                <dd className="text-foreground">{event.price}</dd>
              </div>
            )}
            {event.organizer && (
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Organizer
                </dt>
                <dd className="text-foreground">{event.organizer}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                {isBotEvent ? 'Curated by' : 'Created by'}
              </dt>
              <dd>
                <Link href={`/profile/${authorId}`} className="text-foreground hover:text-green-600 dark:hover:text-green-400">
                  {authorName}
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Description — markdown, full width below the two columns */}
      {event.description && (
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">About this event</h2>
          <Markdown content={event.description} />
        </div>
      )}

      {/* CTAs */}
      {(showRegister || showDiscord || showSource) ? (
        <div className="flex flex-col sm:flex-row gap-3">
          {showRegister && formUrl && (
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Register for Event
            </a>
          )}
          {showDiscord && (
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Join Discord Server
            </a>
          )}
          {showSource && sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground py-3 px-6 rounded-lg font-medium transition-colors border border-border"
            >
              <ExternalLink className="w-4 h-4" />
              View Original Listing
            </a>
          )}
        </div>
      ) : isPast ? (
        <div className="text-center py-3 px-6 rounded-lg bg-muted text-muted-foreground border border-border">
          This event has ended
        </div>
      ) : null}
    </article>
  );
}