"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "@/app/components/ui/Avatar";
import { formatDateShort } from "@/app/lib/formatDate";
import type { ClubInfo, ClubStory } from "@/app/lib/queries";

const FRAME_MS = 5000;
const LOAD_TIMEOUT_MS = 6000;
const CAPTION_MAX = 400;

type Dir = "none" | "next" | "prev";
type CloseMode = "origin" | "down";

interface Props {
  clubs: ClubInfo[];
  stories: Record<string, ClubStory[]>;
  startIndex: number;
  viewAllHrefs: Record<string, string>;
  getOrigin: (username: string) => DOMRect | null;
  onSeen: (username: string) => void;
  onClose: (username: string, href?: string) => void;
}

function clean(s: string | null): string {
  const t = (s || "").replace(/\s+/g, " ").trim();
  return t.length > CAPTION_MAX ? t.slice(0, CAPTION_MAX).trimEnd() + "..." : t;
}

function hueFor(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

function gradientFor(name: string): string {
  const h = hueFor(name);
  return "linear-gradient(135deg, hsl(" + h + " 55% 30%), hsl(" + ((h + 45) % 360) + " 60% 14%))";
}

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function originTransform(card: HTMLElement, o: DOMRect): string {
  const r = card.getBoundingClientRect();
  const s = Math.max(0.05, o.width / r.width);
  const dx = o.left + o.width / 2 - (r.left + r.width / 2);
  const dy = o.top + o.height / 2 - (r.top + r.height / 2);
  return "translate(" + dx + "px, " + dy + "px) scale(" + s + ")";
}

function InstagramGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ChevronGlyph({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export default function StoryViewer({
  clubs,
  stories,
  startIndex,
  viewAllHrefs,
  getOrigin,
  onSeen,
  onClose,
}: Props) {
  const [pos, setPos] = useState<{ ci: number; fi: number; dir: Dir }>({
    ci: startIndex,
    fi: 0,
    dir: "none",
  });
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const [held, setHeld] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(pos);
  const badRef = useRef(bad);
  const pausedRef = useRef(false);
  const readyRef = useRef(true);
  const elapsedRef = useRef(0);
  const waitedRef = useRef(0);
  const closingRef = useRef(false);
  const suppressClick = useRef(false);
  const nextRef = useRef<() => void>(() => {});
  const prevRef = useRef<() => void>(() => {});
  const closeRef = useRef<(href?: string, mode?: CloseMode) => void>(() => {});
  const gesture = useRef({ x: 0, y: 0, dragging: false, held: false, timer: 0 });
  const gestureCleanup = useRef<(() => void) | null>(null);

  const club = clubs[pos.ci];
  const list = club ? stories[club.username] || [] : [];
  const fi = Math.min(pos.fi, Math.max(0, list.length - 1));
  const frame = list[fi];

  useLayoutEffect(() => {
    posRef.current = pos;
    badRef.current = bad;
  });

  const requestClose = useCallback(
    (href?: string, mode: CloseMode = "origin") => {
      if (closingRef.current) return;
      closingRef.current = true;
      pausedRef.current = true;
      const username = clubs[posRef.current.ci].username;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        onClose(username, href);
      };
      const card = cardRef.current;
      if (!card || typeof card.animate !== "function") {
        finish();
        return;
      }
      const reduce = reducedMotion();
      const from = getComputedStyle(card).transform;
      let to: Keyframe = { transform: "scale(0.96)", opacity: 0 };
      if (reduce) {
        to = { opacity: 0 };
      } else if (mode === "down") {
        to = { transform: "translateY(" + window.innerHeight + "px)", opacity: 0 };
      } else {
        const o = getOrigin(username);
        if (o) to = { transform: originTransform(card, o), opacity: 0.2 };
      }
      const duration = reduce ? 120 : 220;
      const backdrop = overlayRef.current ? overlayRef.current.querySelector(".sv__backdrop") : null;
      if (backdrop) {
        backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: "ease-in", fill: "forwards" });
      }
      const anim = card.animate([{ transform: from === "none" ? "none" : from, opacity: 1 }, to], {
        duration,
        easing: "ease-in",
        fill: "forwards",
      });
      anim.onfinish = finish;
      anim.oncancel = finish;
      window.setTimeout(finish, 500);
    },
    [clubs, getOrigin, onClose],
  );

  const goNext = useCallback(() => {
    const { ci, fi: f } = posRef.current;
    const c = clubs[ci];
    const len = (stories[c.username] || []).length;
    if (f < len - 1) {
      setPos({ ci, fi: f + 1, dir: "none" });
      return;
    }
    onSeen(c.username);
    if (ci < clubs.length - 1) setPos({ ci: ci + 1, fi: 0, dir: "next" });
    else requestClose();
  }, [clubs, stories, onSeen, requestClose]);

  const goPrev = useCallback(() => {
    const { ci, fi: f } = posRef.current;
    if (f > 0) setPos({ ci, fi: f - 1, dir: "none" });
    else if (ci > 0) setPos({ ci: ci - 1, fi: 0, dir: "prev" });
    else elapsedRef.current = 0;
  }, []);

  useLayoutEffect(() => {
    nextRef.current = goNext;
    prevRef.current = goPrev;
    closeRef.current = requestClose;
  });

  // open animation, focus, scroll lock
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.focus();
    if (typeof card.animate !== "function") return;
    const reduce = reducedMotion();
    const o = getOrigin(clubs[startIndex].username);
    if (o && !reduce) {
      card.animate(
        [
          { transform: originTransform(card, o), opacity: 0.3 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 300, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
      );
    } else {
      card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 120 : 180 });
    }
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // frame timer (requestAnimationFrame, pausable, waits for the image)
  useLayoutEffect(() => {
    const p = posRef.current;
    const c = clubs[p.ci];
    const f = (stories[c.username] || [])[p.fi];
    elapsedRef.current = 0;
    waitedRef.current = 0;
    readyRef.current = !(f && f.image_url && !badRef.current[f.id]);

    const fills = cardRef.current
      ? Array.from(cardRef.current.querySelectorAll<HTMLElement>(".sv__fill"))
      : [];
    fills.forEach((el, i) => {
      el.style.transform = i < p.fi ? "scaleX(1)" : "scaleX(0)";
    });
    const active = fills[p.fi];

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (!pausedRef.current) {
        if (readyRef.current) {
          elapsedRef.current += dt;
        } else {
          waitedRef.current += dt;
          if (waitedRef.current > LOAD_TIMEOUT_MS) readyRef.current = true;
        }
      }
      const pct = Math.min(1, elapsedRef.current / FRAME_MS);
      if (active) active.style.transform = "scaleX(" + pct + ")";
      if (pct >= 1) {
        nextRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pos.ci, pos.fi]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextRef.current();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevRef.current();
      } else if (e.key === "Tab") {
        const root = overlayRef.current;
        if (!root) return;
        const items = Array.from(
          root.querySelectorAll<HTMLElement>('a[href], button:not([tabindex="-1"])'),
        );
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const lastEl = items[items.length - 1];
        const a = document.activeElement;
        if (!root.contains(a)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && (a === first || a === cardRef.current)) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && a === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const g = gesture.current;
    return () => {
      window.clearTimeout(g.timer);
      if (gestureCleanup.current) gestureCleanup.current();
    };
  }, []);

  // press and hold to pause, swipe down to close
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-sv-ctl]")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (closingRef.current) return;
    suppressClick.current = false;
    const g = gesture.current;
    g.x = e.clientX;
    g.y = e.clientY;
    g.dragging = false;
    g.held = false;
    window.clearTimeout(g.timer);
    g.timer = window.setTimeout(() => {
      g.held = true;
      pausedRef.current = true;
      setHeld(true);
    }, 220);

    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - g.y;
      const dx = ev.clientX - g.x;
      if (!g.dragging && dy > 12 && Math.abs(dy) > Math.abs(dx)) {
        g.dragging = true;
        window.clearTimeout(g.timer);
        pausedRef.current = true;
      }
      if (g.dragging && cardRef.current) {
        const d = Math.max(0, dy);
        cardRef.current.style.transform =
          "translateY(" + d + "px) scale(" + (1 - Math.min(d, 400) / 4000) + ")";
      }
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      gestureCleanup.current = null;
    };
    const up = (ev: PointerEvent) => {
      cleanup();
      window.clearTimeout(g.timer);
      const dy = ev.clientY - g.y;
      if (g.dragging) {
        suppressClick.current = true;
        if (dy > 110) {
          closeRef.current(undefined, "down");
          return;
        }
        const card = cardRef.current;
        if (card) {
          card.style.transition = "transform 180ms ease";
          card.style.transform = "";
          window.setTimeout(() => {
            card.style.transition = "";
          }, 200);
        }
        pausedRef.current = false;
      } else if (g.held) {
        suppressClick.current = true;
        pausedRef.current = false;
        setHeld(false);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    gestureCleanup.current = cleanup;
  };

  const onZone = (dir: "prev" | "next") => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (dir === "next") goNext();
    else goPrev();
  };

  const jumpClub = (d: number) => {
    const t = pos.ci + d;
    if (t < 0 || t >= clubs.length) return;
    setPos({ ci: t, fi: 0, dir: d > 0 ? "next" : "prev" });
  };

  if (!club || !frame) return null;

  const name = club.display_name || club.username;
  const hasImg = !!frame.image_url && !bad[frame.id];
  const safeUrl = frame.post_url && frame.post_url.startsWith("https://") ? frame.post_url : null;
  const badge = frame.is_event ? "Event" : frame.post_type || null;
  const caption = clean(frame.caption);
  const nextFrame = list[fi + 1];
  const viewAll = viewAllHrefs[club.username] || "/clubs?club=" + encodeURIComponent(club.username);

  const onViewAll = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onSeen(club.username);
    requestClose(viewAll);
  };

  return createPortal(
    <div
      ref={overlayRef}
      className={"sv" + (held ? " sv--held" : "")}
      role="dialog"
      aria-modal="true"
      aria-label={name + " posts"}
    >
      <div className="sv__backdrop" onClick={() => requestClose()} />

      {pos.ci > 0 && (
        <button
          type="button"
          className="sv__nav sv__nav--prev"
          data-sv-ctl
          aria-label="Previous club"
          onClick={() => jumpClub(-1)}
        >
          <ChevronGlyph dir="left" />
        </button>
      )}

      <div className="sv__card" ref={cardRef} tabIndex={-1} onPointerDown={onPointerDown}>
        <div className={"sv__stage sv__stage--" + pos.dir} key={club.username}>
          <div className="sv__media" key={frame.id}>
            {hasImg ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="sv__bg"
                  src={frame.image_url as string}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="sv__img"
                  src={frame.image_url as string}
                  alt=""
                  referrerPolicy="no-referrer"
                  onLoad={() => {
                    readyRef.current = true;
                  }}
                  onError={() => {
                    readyRef.current = true;
                    setBad((b) => ({ ...b, [frame.id]: true }));
                  }}
                />
              </>
            ) : (
              <div className="sv__fallback" style={{ background: gradientFor(name) }} />
            )}
          </div>
          <span className="sv__shade" aria-hidden="true" />

          <div className="sv__bars sv__chrome" aria-hidden="true">
            {list.map((s) => (
              <span key={s.id} className="sv__seg">
                <span className="sv__fill" />
              </span>
            ))}
          </div>

          <header className="sv__head sv__chrome">
            <Avatar src={club.avatar_url} name={name} size={28} />
            <span className="sv__name">{name}</span>
            {safeUrl && (
              <a
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="sv__ig"
                data-sv-ctl
                aria-label="View on Instagram (opens in a new tab)"
                title="View on Instagram"
              >
                <InstagramGlyph />
              </a>
            )}
            <time className="sv__time" dateTime={frame.posted_at}>
              {formatDateShort(frame.posted_at)}
            </time>
            <button
              type="button"
              className="sv__x"
              data-sv-ctl
              aria-label="Close"
              onClick={() => requestClose()}
            >
              <CloseGlyph />
            </button>
          </header>

          {hasImg ? (
            (badge || caption) && (
              <div className="sv__body sv__chrome">
                <div className="sv__panel">
                  {badge && <span className="club-card__badge">{badge}</span>}
                  {caption && <p className="sv__caption">{caption}</p>}
                </div>
              </div>
            )
          ) : (
            <div className="sv__quote-wrap sv__chrome">
              {badge && <span className="club-card__badge">{badge}</span>}
              <p className="sv__quote">{caption || "(no caption)"}</p>
            </div>
          )}

          <div className="sv__foot sv__chrome">
            <a
              href={viewAll}
              className="sv__all sv__pill"
              data-sv-ctl
              onClick={onViewAll}
            >
              View all from this club
            </a>
          </div>

          {nextFrame && nextFrame.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="sv__preload"
              src={nextFrame.image_url}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <button
          type="button"
          className="sv__zone sv__zone--prev"
          tabIndex={-1}
          aria-label="Previous post"
          onClick={() => onZone("prev")}
        />
        <button
          type="button"
          className="sv__zone sv__zone--next"
          tabIndex={-1}
          aria-label="Next post"
          onClick={() => onZone("next")}
        />
      </div>

      {pos.ci < clubs.length - 1 && (
        <button
          type="button"
          className="sv__nav sv__nav--next"
          data-sv-ctl
          aria-label="Next club"
          onClick={() => jumpClub(1)}
        >
          <ChevronGlyph dir="right" />
        </button>
      )}
    </div>,
    document.body,
  );
}
