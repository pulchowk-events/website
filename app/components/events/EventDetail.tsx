"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Calendar, MapPin, Building2, DollarSign, User,
} from "lucide-react";
import Markdown from "@/app/components/ui/Markdown";
import { EventDetailActions } from "./EventDetailActions";
import { EventListRow } from "./EventListRow";
import { formatWeekdayLong, daysUntilNPT } from "@/app/lib/formatDate";
import { EventComposer } from "./EventComposer";

interface Props {
  event: {
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
    author?: { id: string; name: string | null; image: string | null; email: string | null } | null;
  };
  isAdmin: boolean;
  isSaved: boolean;
  userId?: string;
  similarEvents: any[];
  moreFromOrganizer: any[];
  savedIds: string[];
  initialEditMode?: boolean;
}

function statusBadge(iso: string, isPast: boolean): { text: string; tone: "ok" | "warn" | "mute" } | null {
  if (isPast) return { text: "Past event", tone: "mute" };
  const d = daysUntilNPT(new Date(iso));
  if (d === 0) return { text: "Happening today", tone: "ok" };
  if (d === 1) return { text: "Tomorrow", tone: "warn" };
  if (d > 1 && d <= 7) return { text: "Starts in " + d + " days", tone: "mute" };
  return null;
}

const CATEGORY_LABELS: Record<string, string> = {
  software: "Software",
  hardware: "Hardware",
  gaming: "Gaming",
  music: "Music",
  sports: "Sports",
  extra: "Extra",
};

const CATEGORY_DOTS: Record<string, string> = {
  software: "var(--cat-event-software)",
  hardware: "var(--cat-event-hardware)",
  gaming: "var(--cat-event-gaming)",
  music: "var(--cat-event-music)",
  sports: "var(--cat-event-sports)",
  extra: "var(--cat-event-extra)",
};

export default function EventDetail({ event, isAdmin, isSaved, userId, similarEvents, moreFromOrganizer, savedIds, initialEditMode = false }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(initialEditMode);

  useEffect(() => {
    setEditOpen(initialEditMode);
  }, [initialEditMode]);

  if (editOpen) {
    return (
      <article className="ev-detail">
        <Link href="/events" className="ev-detail__back">
          <ArrowLeft size={14} />
          Events
        </Link>
        <EventComposer
          userId={userId}
          eventId={event.id}
          initialValues={{
            title: event.title,
            description: event.description,
            event_date: event.event_date,
            form_link: event.form_link,
            category: event.category as any,
            image_url: event.image_url,
            location: event.location,
            price: event.price,
            organizer: event.organizer,
          }}
          onCancel={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            router.refresh();
          }}
        />
      </article>
    );
  }

  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const status = statusBadge(event.event_date, isPast);
  const categoryKey = event.category || "extra";

  return (
    <article className="ev-detail">
      <Link href="/events" className="ev-detail__back">
        <ArrowLeft size={14} />
        Events
      </Link>

      <div className="ev-detail__chips">
        <span className="cat-chip">
          <span className="cat-chip__dot" style={{ background: CATEGORY_DOTS[categoryKey] }} aria-hidden="true" />
          {CATEGORY_LABELS[categoryKey] || event.category}
        </span>
        {status && (
          <span className={"ev-detail__status ev-detail__status--" + status.tone}>{status.text}</span>
        )}
      </div>

      <h1 className="ev-detail__title">{event.title}</h1>

      <div className="ev-detail__grid">
        <div className="ev-detail__poster">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 280px"
              className="ev-detail__poster-img"
              priority
            />
          ) : (
            <span className="ev-detail__poster-fallback">No image</span>
          )}
        </div>

        <div className="ev-detail__info">
          <EventDetailActions
            event={{
              id: event.id,
              title: event.title,
              description: event.description,
              event_date: event.event_date,
              form_link: event.form_link,
              image_url: event.image_url,
              category: event.category as any,
              origin: event.origin,
              source_url: event.source_url,
              created_by: event.created_by,
            }}
            isPast={isPast}
            isSaved={isSaved}
            isAdmin={isAdmin}
            userId={userId}
            onEdit={() => setEditOpen(true)}
          />

          <dl className="ev-detail__dl">
            <div>
              <dt><Calendar size={12} /> Date</dt>
              <dd>{formatWeekdayLong(eventDate)}</dd>
            </div>
            {event.location && (
              <div>
                <dt><MapPin size={12} /> Location</dt>
                <dd>
                  <a
                    href={"https://maps.google.com/?q=" + encodeURIComponent(event.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {event.location}
                  </a>
                </dd>
              </div>
            )}
            {event.price && (
              <div>
                <dt><DollarSign size={12} /> Price</dt>
                <dd>{event.price}</dd>
              </div>
            )}
            {event.organizer && (
              <div>
                <dt><Building2 size={12} /> Organizer</dt>
                <dd>{event.organizer}</dd>
              </div>
            )}
            {event.author?.name && (
              <div>
                <dt><User size={12} /> {event.origin?.startsWith("scraper:") ? "Curated by" : "Posted by"}</dt>
                <dd>
                  <Link href={"/profile/" + event.created_by} className="ev-detail__author-link">
                    {event.author.name}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {event.description && (
        <section className="ev-detail__body">
          <h2 className="ev-detail__body-title">About this event</h2>
          <Markdown content={event.description} />
        </section>
      )}

      {moreFromOrganizer.length > 0 && (
        <section className="ev-detail__section">
          <header className="ev-detail__section-head">
            <h2 className="ev-detail__section-title">More from {event.organizer}</h2>
          </header>
          <div className="row-list">
            {moreFromOrganizer.map((e) => (
              <EventListRow
                key={e.id}
                event={e}
                isPast={new Date(e.event_date) < new Date()}
                saved={savedIds.includes(e.id)}
                userId={userId}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </section>
      )}

      {similarEvents.length > 0 && (
        <section className="ev-detail__section">
          <header className="ev-detail__section-head">
            <h2 className="ev-detail__section-title">Similar events</h2>
          </header>
          <div className="row-list">
            {similarEvents.map((e) => (
              <EventListRow
                key={e.id}
                event={e}
                isPast={new Date(e.event_date) < new Date()}
                saved={savedIds.includes(e.id)}
                userId={userId}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
