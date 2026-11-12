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

function dayKey(iso: string): string {
  const d = new Date(iso);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tKey = dayKey(today.toISOString());
  const y = new Date(today.getTime() - 864e5);
  const yKey = dayKey(y.toISOString());
  const k = dayKey(iso);
  if (k === tKey) return "Today";
  if (k === yKey) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "Asia/Kathmandu" });
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
            <header className="event-day__head">{dayLabel(list[0].event_date)}</header>
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
