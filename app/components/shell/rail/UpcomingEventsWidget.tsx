import Link from "next/link";
import { RailWidget } from "./RailWidget";
import { formatDateShort, } from "@/app/lib/formatDate";

interface Event {
  id: string;
  title: string;
  event_date: string;
}

export function UpcomingEventsWidget({ events }: { events: Event[] }) {
  return (
    <RailWidget title="Upcoming events" action={{ href: "/events", label: "All" }}>
      {events.length === 0 ? (
        <p className="rail-empty">No upcoming events.</p>
      ) : (
        <ul className="rail-events">
          {events.map((e) => (
            <li key={e.id}>
              <Link href={"/events/" + e.id} className="rail-events__row">
                <span className="rail-events__date">
                  <span className="rail-events__date-short">{formatDateShort(e.event_date)}</span>
                </span>
                <span className="rail-events__title">{e.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </RailWidget>
  );
}
