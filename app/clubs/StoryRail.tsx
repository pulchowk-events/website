"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/app/components/ui/Avatar";
import type { ClubInfo, ClubStory } from "@/app/lib/queries";
import StoryViewer from "./StoryViewer";

const SEEN_KEY = "pe:clubs:seen:v1:";
const SEEN_EVENT = "pe:clubs:seen-changed";

interface Props {
  clubs: ClubInfo[];
  stories: Record<string, ClubStory[]>;
  selected: string[];
  toggleHrefs: Record<string, string>;
  viewAllHrefs: Record<string, string>;
}

function newestMs(list: ClubStory[] | undefined): number {
  if (!list || list.length === 0) return 0;
  const t = Date.parse(list[list.length - 1].posted_at);
  return isNaN(t) ? 0 : t;
}

function findAttr(attr: string, value: string): HTMLElement | null {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[" + attr + "]"));
  for (const n of nodes) {
    if (n.getAttribute(attr) === value) return n;
  }
  return null;
}

function subscribeSeen(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(SEEN_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SEEN_EVENT, onChange);
  };
}

// Server snapshot: null means "not ready", so the first paint never marks anything new.
function getServerSeen(): string | null {
  return null;
}

function parseSeen(raw: string | null): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw) return out;
  for (const part of raw.split("|")) {
    const i = part.lastIndexOf("=");
    if (i <= 0) continue;
    const v = Number(part.slice(i + 1));
    if (v > 0) out[part.slice(0, i)] = v;
  }
  return out;
}

export default function StoryRail({ clubs, stories, selected, toggleHrefs, viewAllHrefs }: Props) {
  const router = useRouter();
  const [openAt, setOpenAt] = useState<number | null>(null);
  const pending = useRef<Record<string, number>>({});

  const storyClubs = useMemo(
    () => clubs.filter((c) => (stories[c.username] || []).length > 0),
    [clubs, stories],
  );

  const getSeen = useCallback((): string | null => {
    const parts: string[] = [];
    try {
      for (const c of clubs) {
        const v = Number(localStorage.getItem(SEEN_KEY + c.username));
        if (v > 0) parts.push(c.username + "=" + v);
      }
    } catch {}
    return parts.join("|");
  }, [clubs]);
  const rawSeen = useSyncExternalStore(subscribeSeen, getSeen, getServerSeen);
  const ready = rawSeen !== null;
  const seen = useMemo(() => parseSeen(rawSeen), [rawSeen]);

  const markSeen = useCallback(
    (username: string) => {
      const ms = newestMs(stories[username]);
      if (!ms) return;
      pending.current[username] = ms;
      try {
        localStorage.setItem(SEEN_KEY + username, String(ms));
      } catch {}
    },
    [stories],
  );

  const getOrigin = useCallback((username: string): DOMRect | null => {
    const el = findAttr("data-club-ring", username);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.bottom < 0 || r.right < 0 || r.left > window.innerWidth || r.top > window.innerHeight) {
      return null;
    }
    return r;
  }, []);

  const handleClose = useCallback(
    (username: string, href?: string) => {
      setOpenAt(null);
      const p = pending.current;
      pending.current = {};
      if (Object.keys(p).length > 0) window.dispatchEvent(new Event(SEEN_EVENT));
      if (href) {
        router.push(href);
      } else {
        window.requestAnimationFrame(() => {
          const el = findAttr("data-club-hit", username);
          if (el) el.focus();
        });
      }
    },
    [router],
  );

  return (
    <>
      <nav className="club-rail" aria-label="Club stories and filters">
        {clubs.map((c) => {
          const label = c.display_name || c.username;
          const list = stories[c.username];
          const hasStories = !!list && list.length > 0;
          const on = selected.includes(c.username);
          const isNew = ready && hasStories && newestMs(list) > (seen[c.username] || 0);
          const cls =
            "club-rail__item" + (on ? " club-rail__item--on" : "") + (isNew ? " club-rail__item--new" : "");
          const toggleHref = toggleHrefs[c.username] || "/clubs";
          const inner = (
            <>
              <span className="club-rail__ring" data-club-ring={c.username}>
                <span className="club-rail__dp">
                  <Avatar src={c.avatar_url} name={label} size={52} />
                </span>
              </span>
              <span className="club-rail__name">{label}</span>
            </>
          );
          return (
            <div key={c.username} className={cls}>
              {hasStories ? (
                <button
                  type="button"
                  className="club-rail__hit"
                  data-club-hit={c.username}
                  title={label}
                  aria-label={label + (isNew ? ", new posts" : "") + ", view posts"}
                  onClick={() => setOpenAt(storyClubs.findIndex((s) => s.username === c.username))}
                >
                  {inner}
                </button>
              ) : (
                <Link
                  href={toggleHref}
                  className="club-rail__hit"
                  data-club-hit={c.username}
                  title={label}
                  aria-current={on ? "true" : undefined}
                >
                  {inner}
                </Link>
              )}
              {on && hasStories && (
                <Link
                  href={toggleHref}
                  className="club-rail__x"
                  aria-label={"Remove filter: " + label}
                  title="Remove filter"
                >
                  &times;
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {openAt !== null && openAt >= 0 && storyClubs[openAt] && (
        <StoryViewer
          clubs={storyClubs}
          stories={stories}
          startIndex={openAt}
          viewAllHrefs={viewAllHrefs}
          getOrigin={getOrigin}
          onSeen={markSeen}
          onClose={handleClose}
        />
      )}
    </>
  );
}
