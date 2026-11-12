import Link from "next/link";
import { formatTime, daysUntilNPT } from "@/app/lib/formatDate";

interface EventRowProps {
  event: {
    id: string;
    title: string;
    event_date: string;
    category: string | null;
    location?: string | null;
    price?: string | null;
  };
  compact?: boolean;
}

const MONTH = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function dateParts(iso: string) {
  const d = new Date(iso);
  return {
    month: MONTH[d.getMonth()],
    day: d.getDate(),
    dow: DOW[d.getDay()],
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
      <span className="event-row__date">
        <span className="event-row__month">{dp.month}</span>
        <span className="event-row__day">{dp.day}</span>
        <span className="event-row__dow">{dp.dow}</span>
      </span>
      <div className="event-row__body">
        <p className="row-title">{event.title}</p>
        <div className="row-meta">
          <span>{formatTime(event.event_date)}</span>
          {event.location && <><span className="row-dot">·</span><span>{event.location}</span></>}
        </div>
        {status && <span className="event-row__status">{status}</span>}
      </div>
    </Link>
  );
}
