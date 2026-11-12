"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ExternalLink, Calendar, Clock, Check } from "lucide-react";
import { formatDateLong, formatTime } from "@/app/lib/formatDate";
import { toast } from "sonner";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  form_link: string;
  image_url: string | null;
  created_at: string;
  category: string;
  created_by: string;
}

export default function AdminPendingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    fetchPendingEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPendingEvents() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/events/pending");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.events);
      setUsernames(data.usernames);
      setSelected(new Set());
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to load pending events");
    } finally {
      setLoading(false);
    }
  }

  async function handleEventAction(id: string, approve: boolean) {
    try {
      setProcessing((prev) => ({ ...prev, [id]: true }));
      const endpoint = approve ? "/api/admin/events/verify" : "/api/events/remove";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id }),
      });
      if (!res.ok) {
        throw new Error(approve ? "Failed to verify event" : "Failed to remove event");
      }
      toast.success(approve ? "Event approved" : "Event removed");
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function bulkAction(action: "approve" | "reject") {
    if (selected.size === 0) return;
    setBulkProcessing(action);
    try {
      const res = await fetch("/api/admin/events/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const n = action === "approve" ? (data.approved ?? selected.size) : (data.rejected ?? selected.size);
      toast.success(
        action === "approve"
          ? "Approved " + n + " event" + (n === 1 ? "" : "s")
          : "Rejected " + n + " event" + (n === 1 ? "" : "s")
      );
      const removed = new Set(selected);
      setEvents((prev) => prev.filter((e) => !removed.has(e.id)));
      setSelected(new Set());
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      setBulkProcessing(null);
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === events.length) setSelected(new Set());
    else setSelected(new Set(events.map((e) => e.id)));
  }

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No pending events.</p>
        <p className="empty-state__desc">Every submitted event has been reviewed.</p>
      </div>
    );
  }

  const allSelected = selected.size === events.length && events.length > 0;

  return (
    <div>
      <div className="admin-select-all">
        <button
          type="button"
          className="admin-checkbox"
          data-checked={allSelected ? "true" : "false"}
          onClick={toggleAll}
          aria-label={allSelected ? "Deselect all" : "Select all"}
        >
          <Check size={12} />
        </button>
        <span>
          {selected.size > 0
            ? selected.size + " of " + events.length + " selected"
            : events.length + " pending event" + (events.length === 1 ? "" : "s")}
        </span>
      </div>

      <div className="admin-pending">
        {events.map((event) => (
          <article key={event.id} className="admin-pending__card">
            <div className="admin-pending__layout">
              <div className="admin-pending__check">
                <button
                  type="button"
                  className="admin-checkbox"
                  data-checked={selected.has(event.id) ? "true" : "false"}
                  onClick={() => toggle(event.id)}
                  aria-label={selected.has(event.id) ? "Deselect" : "Select"}
                >
                  <Check size={12} />
                </button>
              </div>

              <div className="admin-pending__media">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 192px"
                    className="admin-pending__img"
                  />
                ) : (
                  <span className="admin-pending__no-img">No image</span>
                )}
              </div>

              <div className="admin-pending__body">
                <div className="admin-pending__badges">
                  <span className="tag" style={{ "--c": "var(--m)" } as React.CSSProperties}>
                    {event.category}
                  </span>
                  <span className="admin-pending__by">
                    by {usernames[event.created_by] || "Unknown user"}
                  </span>
                </div>

                <h3 className="admin-pending__title">{event.title}</h3>

                <div className="admin-pending__meta">
                  <span className="admin-pending__meta-item">
                    <Calendar size={14} />
                    {formatDateLong(event.event_date)}
                  </span>
                  <span className="admin-pending__meta-item">
                    <Clock size={14} />
                    {formatTime(event.event_date)}
                  </span>
                </div>

                <p className="admin-pending__desc">{event.description}</p>

                <a
                  href={event.form_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-pending__link"
                >
                  <ExternalLink size={14} />
                  Open registration form
                </a>
              </div>
            </div>

            <footer className="admin-pending__foot">
              <button
                type="button"
                onClick={() => handleEventAction(event.id, false)}
                disabled={!!processing[event.id] || !!bulkProcessing}
                className="btn btn--secondary"
                style={{ color: "var(--danger)" }}
              >
                <XCircle size={14} style={{ marginRight: 6 }} />
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleEventAction(event.id, true)}
                disabled={!!processing[event.id] || !!bulkProcessing}
                className="btn btn--primary"
              >
                <CheckCircle size={14} style={{ marginRight: 6 }} />
                Approve
              </button>
            </footer>
          </article>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="admin-bulk-bar">
          <span className="admin-bulk-bar__count">
            {selected.size} selected
          </span>
          <div className="admin-bulk-bar__actions">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setSelected(new Set())}
              disabled={!!bulkProcessing}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              style={{ color: "var(--danger)" }}
              onClick={() => bulkAction("reject")}
              disabled={!!bulkProcessing}
            >
              <XCircle size={12} style={{ marginRight: 4 }} />
              {bulkProcessing === "reject" ? "Rejecting…" : "Reject all"}
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => bulkAction("approve")}
              disabled={!!bulkProcessing}
            >
              <CheckCircle size={12} style={{ marginRight: 4 }} />
              {bulkProcessing === "approve" ? "Approving…" : "Approve all"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
