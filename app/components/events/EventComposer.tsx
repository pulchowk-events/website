"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { MarkdownEditor } from "@/app/components/ui/MarkdownEditor";
import { EventPreview } from "./EventPreview";
import SignInModal from "@/app/components/signIn/SignInModal";

type EventCategory = "software" | "gaming" | "hardware" | "music" | "sports" | "extra";

const categories: { value: EventCategory; label: string }[] = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "gaming", label: "Gaming" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "extra", label: "Extra" },
];

function toNepalInputValue(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return get("year") + "-" + get("month") + "-" + get("day") + "T" + hour + ":" + get("minute");
}

interface Props {
  userId?: string;
  eventId?: string;
  initialValues?: {
    title: string;
    description: string;
    event_date: string;
    form_link: string;
    category: EventCategory;
    image_url?: string | null;
    location?: string | null;
    price?: string | null;
    organizer?: string | null;
  };
  onSaved?: () => void;
  onCancel?: () => void;
  fullPage?: boolean;
}

export function EventComposer({ userId, eventId, initialValues, onSaved, onCancel, fullPage }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const isEdit = !!eventId;
  const [expanded, setExpanded] = useState(isEdit || !!fullPage);
  const [signInOpen, setSignInOpen] = useState(false);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [eventDate, setEventDate] = useState(
    initialValues?.event_date ? toNepalInputValue(initialValues.event_date) : ""
  );
  const [formLink, setFormLink] = useState(initialValues?.form_link || "");
  const [category, setCategory] = useState<EventCategory>(initialValues?.category || "software");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!image) { setImagePreview(null); return; }
    const url = URL.createObjectURL(image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const collapse = () => {
    if (onCancel) { onCancel(); return; }
    if (fullPage) { router.push("/events"); return; }
    setExpanded(false);
    setMode("write");
  };

  const expand = () => {
    if (!session?.user?.id) { setSignInOpen(true); return; }
    setExpanded(true);
  };

  const submit = async () => {
    if (!userId) return;
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!description.trim()) { toast.error("Description is required"); return; }
    if (!eventDate) { toast.error("Date and time is required"); return; }
    if (!formLink.trim()) { toast.error("Registration link is required"); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("eventDate", eventDate + ":00+05:45");
      fd.append("formLink", formLink.trim());
      fd.append("category", category);
      if (image) fd.append("image", image);

      const url = isEdit ? "/api/events/" + eventId : "/api/events/submit";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save event");

      if (isEdit) toast.success("Event updated");
      else toast.success("Event submitted for review");

      if (onSaved) onSaved();
      else if (isEdit) router.refresh();
      else if (fullPage) router.push("/events");
      else {
        setTitle(""); setDescription(""); setEventDate(""); setFormLink("");
        setCategory("software"); setImage(null);
        setExpanded(false); setMode("write");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape" && !submitting) {
      collapse();
    }
  };

  if (!expanded) {
    return (
      <>
        <button type="button" className="composer-stub" onClick={expand}>
          {session ? "Submit an event…" : "Sign in to submit an event"}
        </button>
        <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
      </>
    );
  }

  const canSubmit =
    title.trim() && description.trim() && eventDate && formLink.trim() && !submitting;

  return (
    <>
      <form
        className="composer"
        onKeyDown={onKey}
        onSubmit={(e) => { e.preventDefault(); submit(); }}
      >
        <div className="composer__head">
          <div className="seg">
            <button
              type="button"
              className={"seg__item" + (mode === "write" ? " seg__item--on" : "")}
              onClick={() => setMode("write")}
            >
              Write
            </button>
            <button
              type="button"
              className={"seg__item" + (mode === "preview" ? " seg__item--on" : "")}
              onClick={() => setMode("preview")}
            >
              Preview
            </button>
          </div>
          <button
            type="button"
            className="row-icon-btn"
            onClick={collapse}
            aria-label={isEdit ? "Cancel edit" : "Close composer"}
            disabled={submitting}
            style={{ marginLeft: "auto" }}
          >
            <X size={16} />
          </button>
        </div>

        {mode === "write" ? (
          <div className="event-form__grid">
            <div className="event-form__col">
              <div className="field">
                <label htmlFor="ev-title" className="field__label">
                  Title <span className="field__label-req">*</span>
                </label>
                <input
                  id="ev-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  required
                  disabled={submitting}
                  autoFocus={!isEdit}
                />
              </div>

              <div className="field">
                <span className="field__label">
                  Category <span className="field__label-req">*</span>
                </span>
                <div className="tabs" role="tablist" aria-label="Category">
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      role="tab"
                      aria-selected={category === c.value}
                      className={"tab" + (category === c.value ? " tab--on" : "")}
                      onClick={() => setCategory(c.value)}
                      disabled={submitting}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="ev-date" className="field__label">
                  Date and time (Nepal) <span className="field__label-req">*</span>
                </label>
                <input
                  id="ev-date"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="input"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="field">
                <label htmlFor="ev-link" className="field__label">
                  Registration link <span className="field__label-req">*</span>
                </label>
                <input
                  id="ev-link"
                  type="url"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className="input"
                  placeholder="https://"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="field">
                <label htmlFor="ev-image" className="field__label">
                  Image <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="ev-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="input input--file"
                  disabled={submitting}
                />
                {image ? (
                  <p className="field__hint">Selected: {image.name}</p>
                ) : initialValues?.image_url ? (
                  <p className="field__hint">Current image will be kept.</p>
                ) : null}
              </div>
            </div>

            <div className="field event-form__desc">
              <span className="field__label">
                Description <span className="field__label-req">*</span>
              </span>
              <MarkdownEditor
                value={description}
                onChange={setDescription}
                mode="write"
                onModeChange={() => {}}
                hideTabs
                maxLength={20000}
                minHeight={280}
                placeholder="Write the event description… Markdown supported."
              />
            </div>
          </div>
        ) : (
          <EventPreview
            title={title}
            description={description}
            eventDate={eventDate}
            category={category}
            imageUrl={initialValues?.image_url}
            imagePreviewUrl={imagePreview}
            formLink={formLink}
            location={initialValues?.location}
            price={initialValues?.price}
            organizer={initialValues?.organizer}
          />
        )}

        <div className="composer__foot">
          <span className="composer__hint">⌘ Enter to save · Esc to cancel</span>
          <div className="composer__foot-actions">
            <button type="button" className="btn btn--secondary btn--sm" onClick={collapse} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={!canSubmit}>
              {submitting
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Submit event"}
            </button>
          </div>
        </div>
      </form>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
