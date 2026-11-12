import Link from "next/link";
import Image from "next/image";
import { formatDateShort, formatTime } from "@/app/lib/formatDate";

interface Props {
  event: {
    id: string;
    title: string;
    event_date: string;
    image_url: string | null;
    location?: string | null;
  };
}

export function EventGridCard({ event }: Props) {
  return (
    <Link href={"/events/" + event.id} className="event-grid-card">
      <span className="event-grid-card__poster">
        {event.image_url ? (
          <Image src={event.image_url} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" unoptimized />
        ) : (
          <span className="event-grid-card__fallback">No image</span>
        )}
      </span>
      <div className="event-grid-card__body">
        <p className="row-title">{event.title}</p>
        <p className="row-meta">{formatDateShort(event.event_date)} · {formatTime(event.event_date)}</p>
        {event.location && <p className="row-meta">{event.location}</p>}
      </div>
    </Link>
  );
}
