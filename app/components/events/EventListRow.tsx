"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { formatTime, daysUntilNPT } from "@/app/lib/formatDate";
import { SaveButton } from "@/app/components/shell/SaveButton";
import { ShareMenu } from "@/app/components/shell/ShareMenu";
import { OverflowMenu, type OverflowItem } from "@/app/components/shell/OverflowMenu";
import DeleteEventDialog from "./DeleteEventDialog";

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
  event: Event;
  isPast: boolean;
  saved: boolean;
  userId?: string;
  isAdmin: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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

function statusLabel(iso: string, isPast: boolean) {
  if (isPast) return null;
  const d = daysUntilNPT(new Date(iso));
  if (d === 0) return { text: "Happening today", tone: "ok" as const };
  if (d === 1) return { text: "Tomorrow", tone: "warn" as const };
  if (d > 1 && d <= 7) return { text: "In " + d + " days", tone: "mute" as const };
  return null;
}

function sourceTag(origin: string | null | undefined): string | null {
  if (!origin || !origin.startsWith("scraper:")) return null;
  const key = origin.slice(8);
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function EventListRow({ event, isPast, saved, userId, isAdmin, onEdit, onDelete }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const dp = dateParts(event.event_date);
  const status = statusLabel(event.event_date, isPast);
  const source = sourceTag(event.origin);
  const isOwner = userId && event.created_by === userId;
  const isBot = event.origin?.startsWith("scraper:") || false;

  const shareUrl = typeof window !== "undefined"
    ? window.location.origin + "/events/" + event.id
    : "https://pulchowkevents.netlify.app/events/" + event.id;

  const addToCalendar = () => {
    window.location.href = "/api/events/" + event.id + "/ics";
  };

  const handleEdit = () => {
    if (onEdit) onEdit(event.id);
    else router.push(pathname + "?edit=true");
  };

  const handleDelete = () => {
    if (onDelete) onDelete(event.id);
    else setDeleteId(event.id);
  };

  const overflowItems: OverflowItem[] = [];
  if ((isAdmin || isOwner) && !isBot) {
    overflowItems.push({ label: "Edit event", onClick: handleEdit });
    overflowItems.push({ label: "Delete event", onClick: handleDelete, tone: "danger" });
  }

  return (
    <>
      <div className="event-list-row">
        <Link href={"/events/" + event.id} className="event-list-row__main">
          <span className="event-list-row__date">
            <span className="event-list-row__month">{dp.month}</span>
            <span className="event-list-row__day">{dp.day}</span>
            <span className="event-list-row__dow">{dp.dow}</span>
          </span>

          <div className="event-list-row__body">
            <div className="event-list-row__title-row">
              <p className="row-title">{event.title}</p>
              {source && <span className="event-list-row__source">via {source}</span>}
            </div>
            <div className="row-meta">
              <span>{formatTime(event.event_date)}</span>
              {event.location && <><span className="row-dot">·</span><span>{event.location}</span></>}
              {event.price && <><span className="row-dot">·</span><span>{event.price}</span></>}
              {event.organizer && <><span className="row-dot">·</span><span>{event.organizer}</span></>}
            </div>
            {status && <span className={"event-list-row__status event-list-row__status--" + status.tone}>{status.text}</span>}
          </div>
        </Link>

        <div className="event-list-row__actions">
          <button
            type="button"
            className="row-icon-btn"
            onClick={addToCalendar}
            aria-label="Add to calendar"
            title="Add to calendar"
          >
            <CalendarPlus size={16} />
          </button>
          <SaveButton itemType="event" itemId={event.id} initialSaved={saved} />
          <ShareMenu url={shareUrl} title={event.title} />
          {overflowItems.length > 0 && <OverflowMenu items={overflowItems} />}
        </div>
      </div>

      <DeleteEventDialog
        eventId={deleteId}
        eventTitle={event.title}
        onClose={() => setDeleteId(null)}
      />
    </>
  );
}
