import { EventListRow } from "./EventListRow";

interface Event {
  id: string;
  title: string;
  event_date: string;
  category: string | null;
  location?: string | null;
  price?: string | null;
  organizer?: string | null;
  origin?: string | null;
  created_by?: string | null;
}

interface Props {
  events: Event[];
  isPast: boolean;
  savedIds: Set<string>;
  userId?: string;
  isAdmin: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function nptDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  return get("year") + "-" + get("month") + "-" + get("day");
}

function dayKey(iso: string): string {
  return nptDateKey(new Date(iso));
}

function dayLabel(iso: string): string {
  const now = new Date();
  const todayKey = nptDateKey(now);
  const yesterdayKey = nptDateKey(new Date(now.getTime() - 864e5));
  const k = nptDateKey(new Date(iso));
  if (k === todayKey) return "Today";
  if (k === yesterdayKey) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kathmandu",
  });
}

export function EventListGrouped({ events, isPast, savedIds, userId, isAdmin, onEdit, onDelete }: Props) {
  const groups = new Map<string, Event[]>();
  for (const e of events) {
    const k = dayKey(e.event_date);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(e);
  }

  const keys = Array.from(groups.keys()).sort((a, b) => (isPast ? b.localeCompare(a) : a.localeCompare(b)));

  return (
    <>
      {keys.map((k) => {
        const list = groups.get(k)!;
        return (
          <section key={k} className="event-day">
            <header className="event-day__head" suppressHydrationWarning>
              {dayLabel(list[0].event_date)}
            </header>
            <div className="event-day__body">
              {list.map((e) => (
                <EventListRow
                  key={e.id}
                  event={e}
                  isPast={isPast}
                  saved={savedIds.has(e.id)}
                  userId={userId}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
