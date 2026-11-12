"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, CalendarPlus, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import DeleteEventDialog from "./DeleteEventDialog";
import EditEventModal from "./EditEventModal";

interface EventForActions {
  id: string;
  title: string;
  description: string;
  event_date: string;
  form_link: string;
  image_url: string | null;
  category: "software" | "gaming" | "hardware" | "music" | "sports" | "extra";
  origin?: string | null;
  source_url?: string | null;
  created_by?: string | null;
}

interface Props {
  event: EventForActions;
  isPast: boolean;
  isSaved: boolean;
  isAdmin: boolean;
  userId?: string;
}

function discordInvite(): string {
  return "https://discord.gg/cQ5gxusATk";
}

export function EventDetailActions({ event, isPast, isSaved, isAdmin, userId }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(isSaved);
  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isBot = event.origin?.startsWith("scraper:") || false;
  const isOwner = !!userId && event.created_by === userId;
  const canManage = (isAdmin || isOwner) && !isBot;
  const linksAreSame = !!event.source_url && event.source_url.trim().toLowerCase() === event.form_link.trim().toLowerCase();
  const showRegister = !isPast && !!event.form_link;
  const showDiscord = showRegister && linksAreSame;
  const showSource = !isPast && !!event.source_url && !linksAreSame;

  const toggleSave = async () => {
    setSaving(true);
    const next = !saved;
    setSaved(next);
    try {
      const res = await fetch("/api/saves", {
        method: next ? "PUT" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_type: "event", item_id: event.id }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Saved" : "Removed from Saved", {
        duration: 3000,
        action: next ? undefined : {
          label: "Undo",
          onClick: () => {
            setSaved(true);
            fetch("/api/saves", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ item_type: "event", item_id: event.id }),
            });
          },
        },
      });
    } catch {
      setSaved(!next);
      toast.error("Could not save");
    } finally {
      setSaving(false);
    }
  };

  const addToCalendar = () => {
    window.location.href = "/api/events/" + event.id + "/ics";
  };

  const shareUrl = typeof window !== "undefined"
    ? window.location.origin + "/events/" + event.id
    : "https://pulchowkevents.netlify.app/events/" + event.id;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
      setShareOpen(false);
    } catch {
      toast.error("Could not copy");
    }
  };

  const whatsapp = () => {
    window.open("https://wa.me/?text=" + encodeURIComponent(event.title + " " + shareUrl), "_blank", "noopener,noreferrer");
    setShareOpen(false);
  };

  return (
    <>
      <div className="ev-actions">
        {showRegister && (
          <a
            href={event.form_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary ev-actions__primary"
          >
            <ExternalLink size={14} style={{ marginRight: 8 }} />
            Register
          </a>
        )}
        {showDiscord && (
          <a
            href={discordInvite()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary"
          >
            Join Discord
          </a>
        )}
        {showSource && (
          <a
            href={event.source_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary"
          >
            View original
          </a>
        )}
        <button type="button" className={"row-icon-btn" + (saved ? " row-icon-btn--on" : "")} onClick={toggleSave} disabled={saving} aria-pressed={saved} aria-label={saved ? "Unsave" : "Save"}>
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </button>
        <button type="button" className="row-icon-btn" onClick={addToCalendar} aria-label="Add to calendar">
          <CalendarPlus size={16} />
        </button>
        <div className="overflow-wrap">
          <button type="button" className="row-icon-btn" onClick={() => setShareOpen((v) => !v)} aria-label="Share">
            <Share2 size={16} />
          </button>
          {shareOpen && (
            <div className="menu">
              <button type="button" className="menu__item" onClick={copyLink}>Copy link</button>
              <button type="button" className="menu__item" onClick={whatsapp}>Share to WhatsApp</button>
            </div>
          )}
        </div>
        {canManage && (
          <div className="overflow-wrap">
            <button type="button" className="row-icon-btn" onClick={() => setEditOpen(true)} aria-label="Edit event">
              <MoreHorizontal size={16} />
            </button>
          </div>
        )}
      </div>

      {isPast && (
        <div className="ev-ended">This event has ended.</div>
      )}

      {editOpen && (
        <EditEventModal event={event} onClose={() => setEditOpen(false)} />
      )}

      <DeleteEventDialog
        eventId={deleteOpen ? event.id : null}
        eventTitle={event.title}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
