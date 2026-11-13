import Link from "next/link";
import { SmartImg } from "@/app/components/ui/SmartImg";
import { daysUntilNPT } from "@/app/lib/formatDate";

interface EventRowProps {
  event: {
    id: string;
    title: string;
    event_date: string;
    category: string | null;
    location?: string | null;
    price?: string | null;
    image_url?: string | null;
  };
  compact?: boolean;
}

function dateParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    month: "short",
    day: "numeric",
    weekday: "short",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  return {
    month: get("month").toUpperCase(),
    day: parseInt(get("day") || "0", 10),
    dow: get("weekday"),
  };
}

function statusLabel(iso: string): string | null {
  const d = daysUntilNPT(new Date(iso));
  if (d === 0) return "Happening today";
  if (d === 1) return "Tomorrow";
  if (d > 1 && d <= 7) return "In " + d + " days";
  return null;
}

export function EventRow({ event, compact = false }: EventRowProps) {
  const dp = dateParts(event.event_date);
  const status = statusLabel(event.event_date);
  return (
    <Link href={"/events/" + event.id} className={"row event-row" + (compact ? " event-row--compact" : "")}>
      <SmartImg
        src={event.image_url}
        alt=""
        seed={event.id}
        className="event-row__poster-img"
        fallback={
          <span className="event-row__date">
            <span className="event-row__month">{dp.month}</span>
            <span className="event-row__day">{dp.day}</span>
            <span className="event-row__dow">{dp.dow}</span>
          </span>
        }
      />
      <div className="event-row__body">
        <p className="row-title">{event.title}</p>
        {event.location && (
          <div className="row-meta">
            <span>{event.location}</span>
          </div>
        )}
        {status && <span className="event-row__status">{status}</span>}
      </div>
    </Link>
  );
}
