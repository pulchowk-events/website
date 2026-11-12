"use client";

import Image from "next/image";
import { Calendar, Clock, MapPin, DollarSign, Building2 } from "lucide-react";
import { formatWeekdayLong, formatTime, daysUntilNPT } from "@/app/lib/formatDate";
import Markdown from "@/app/components/ui/Markdown";

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

interface Props {
  title: string;
  description: string;
  eventDate: string;
  category: string;
  imageUrl?: string | null;
  imagePreviewUrl?: string | null;
  formLink?: string;
  location?: string | null;
  price?: string | null;
  organizer?: string | null;
}

function statusLabel(iso: string): { text: string; tone: "ok" | "warn" | "mute" } | null {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const days = daysUntilNPT(d);
  if (days < 0) return { text: "Past event", tone: "mute" };
  if (days === 0) return { text: "Happening today", tone: "ok" };
  if (days === 1) return { text: "Tomorrow", tone: "warn" };
  if (days <= 7) return { text: "Starts in " + days + " days", tone: "mute" };
  return null;
}

export function EventPreview({
  title, description, eventDate, category,
  imageUrl, imagePreviewUrl, location, price, organizer,
}: Props) {
  const showImage = imagePreviewUrl || imageUrl;
  const dateObj = eventDate ? new Date(eventDate) : null;
  const validDate = dateObj && !isNaN(dateObj.getTime()) ? dateObj : null;
  const status = validDate ? statusLabel(validDate.toISOString()) : null;
  const categoryKey = category || "extra";

  return (
    <article className="ev-detail ev-detail--preview">
      <div className="ev-detail__chips">
        <span className="cat-chip">
          <span className="cat-chip__dot" style={{ background: CATEGORY_DOTS[categoryKey] }} aria-hidden="true" />
          {CATEGORY_LABELS[categoryKey] || category}
        </span>
        {status && (
          <span className={"ev-detail__status ev-detail__status--" + status.tone}>
            {status.text}
          </span>
        )}
      </div>

      <h1 className="ev-detail__title">
        {title.trim() || <span style={{ color: "var(--text-3)", fontWeight: 400 }}>Untitled event</span>}
      </h1>

      <div className="ev-detail__grid">
        <div className="ev-detail__poster-wrap">
          <div className="ev-detail__poster">
            {showImage ? (
              <Image
                src={showImage}
                alt={title}
                fill
                unoptimized
                sizes="(max-width: 1023px) 100vw, 280px"
                className="ev-detail__poster-img"
              />
            ) : (
              <span className="ev-detail__poster-fallback">No image</span>
            )}
          </div>
        </div>

        <div className="ev-detail__info">
          <dl className="ev-detail__dl">
            {validDate && (
              <>
                <div>
                  <dt><Calendar size={12} /> Date</dt>
                  <dd>{formatWeekdayLong(validDate)}</dd>
                </div>
                <div>
                  <dt><Clock size={12} /> Time</dt>
                  <dd>{formatTime(validDate)}</dd>
                </div>
              </>
            )}
            {location && (
              <div>
                <dt><MapPin size={12} /> Location</dt>
                <dd>{location}</dd>
              </div>
            )}
            {price && (
              <div>
                <dt><DollarSign size={12} /> Price</dt>
                <dd>{price}</dd>
              </div>
            )}
            {organizer && (
              <div>
                <dt><Building2 size={12} /> Organizer</dt>
                <dd>{organizer}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {description.trim() && (
        <section className="ev-detail__body">
          <h2 className="ev-detail__body-title">About this event</h2>
          <Markdown content={description} />
        </section>
      )}
    </article>
  );
}
