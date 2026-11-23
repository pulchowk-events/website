// Shared helpers for the clubs feature. Pure functions only, safe in server and client code.

export const CLUB_MIN_INDEXED_POSTS = 3;
export const CLUB_STORY_WINDOW_DAYS = 14;

// Instagram usernames never contain "-", so "." -> "-" is a one-to-one mapping.
// Pages find a club by comparing slugOf(username) with the slug, never by reversing it.
export function slugOf(username: string): string {
  return String(username || "").trim().toLowerCase().replace(/\./g, "-");
}

export function instagramProfileUrl(username: string): string {
  return "https://www.instagram.com/" + encodeURIComponent(username) + "/";
}

// Short relative label ("now", "5m", "3h", "2d", "1w"). Pure: the caller passes the
// current time, so no component ever needs Date.now. Returns "" past 30 days so the
// caller can fall back to a calendar date.
export function relativeAgo(iso: string, nowMs: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, Math.floor((nowMs - t) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h";
  const d = Math.floor(h / 24);
  if (d < 7) return d + "d";
  if (d < 30) return Math.floor(d / 7) + "w";
  return "";
}
