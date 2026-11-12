import Image from 'next/image';
import Link from 'next/link';
import { formatWeekdayLong, formatTime } from '@/app/lib/formatDate';
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

  const sourceUrl = event.source_url;
  const formUrl = event.form_link;
  const linksAreSame = !!(sourceUrl && formUrl && sourceUrl.trim().toLowerCase() === formUrl.trim().toLowerCase());

  const showRegister = !isPast && !!formUrl;
  const showDiscord = !isPast && !!formUrl && linksAreSame;
  const showSource = !isPast && !!sourceUrl && !linksAreSame;
  const hasAnyCTA = showRegister || showDiscord || showSource;

  return (
    <article className="event-detail">
      <Link href="/events" className="event-detail__back">
        <ArrowLeft size={14} />
        Back to Events
      </Link>

      <div className="event-detail__grid">
        <div>
          <div className="event-detail__media">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 320px"
                className="event-detail__img"
                priority
              />
            ) : (
              <div className="event-detail__fallback">
                <CategoryIcon size={64} />
              </div>
            )}
            {isPast && (
              <span className="tag event-detail__past" style={{ '--c': 'var(--danger)' } as React.CSSProperties}>
                Past event
              </span>
            )}
          </div>
        </div>

        <div className="event-detail__content">
          <div className="event-detail__badges">
            <span className="tag" style={{ '--c': 'var(--c)' } as React.CSSProperties}>
              <CategoryIcon size={12} />
              <span style={{ textTransform: 'capitalize' }}>{event.category}</span>
            </span>
            {sourceLabel && <span className="tag" style={{ '--c': 'var(--m)' } as React.CSSProperties}>via {sourceLabel}</span>}
            {attendanceLabel && <span className="tag" style={{ '--c': 'var(--m)' } as React.CSSProperties}>{attendanceLabel}</span>}
          </div>

          <h1 className="event-detail__title">{event.title}</h1>

          <dl className="event-detail__dl">
            <div>
              <dt className="event-detail__dt">
                <Calendar size={12} /> Date
              </dt>
              <dd className="event-detail__dd">{formatWeekdayLong(eventDate)}</dd>
            </div>
            <div>
              <dt className="event-detail__dt">
                <Clock size={12} /> Time
              </dt>
              <dd className="event-detail__dd">{formatTime(eventDate)}</dd>
            </div>
            {event.location && (
              <div>
                <dt className="event-detail__dt">
                  <MapPin size={12} /> Location
                </dt>
                <dd className="event-detail__dd">{event.location}</dd>
              </div>
            )}
            {event.price && (
              <div>
                <dt className="event-detail__dt">
                  <DollarSign size={12} /> Price
                </dt>
                <dd className="event-detail__dd">{event.price}</dd>
              </div>
            )}
            {event.organizer && (
              <div>
                <dt className="event-detail__dt">
                  <Building2 size={12} /> Organizer
                </dt>
                <dd className="event-detail__dd">{event.organizer}</dd>
              </div>
            )}
            <div>
              <dt className="event-detail__dt">{isBotEvent ? 'Curated by' : 'Created by'}</dt>
              <dd className="event-detail__dd">
                <Link href={'/profile/' + authorId} className="event-detail__author">
                  {authorName}
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {event.description && (
        <div className="event-detail__about">
          <h2 className="event-detail__about-title">About this event</h2>
          <Markdown content={event.description} />
        </div>
      )}

      {hasAnyCTA ? (
        <div className="event-detail__ctas">
          {showRegister && formUrl && (
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary event-detail__cta"
            >
              <span className="btn__label">
                <ExternalLink size={16} style={{ marginRight: 8 }} />
                Register for Event
              </span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                <ExternalLink size={16} style={{ marginRight: 8 }} />
                Register for Event
              </span>
            </a>
          )}
          {showDiscord && (
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--secondary event-detail__cta"
            >
              <span className="btn__label">
                <ExternalLink size={16} style={{ marginRight: 8 }} />
                Join Discord Server
              </span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                <ExternalLink size={16} style={{ marginRight: 8 }} />
                Join Discord Server
              </span>
            </a>
          )}
          {showSource && sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--secondary event-detail__cta"
            >
              <span className="btn__label">
                <ExternalLink size={16} style={{ marginRight: 8 }} />
                View Original Listing
              </span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                <ExternalLink size={16} style={{ marginRight: 8 }} />
                View Original Listing
              </span>
            </a>
          )}
        </div>
      ) : isPast ? (
        <p className="event-detail__ended">This event has ended.</p>
      ) : null}
    </article>
  );
}
