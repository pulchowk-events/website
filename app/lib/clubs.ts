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
