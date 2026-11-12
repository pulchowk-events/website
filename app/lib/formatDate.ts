// Deterministic, timezone-locked date formatting.
// Never use date-fns `format()` on the server: it renders in the runtime's
// local timezone (UTC on Netlify), which mismatches the client (NPT) and
// causes hydration errors. All user-facing dates go through this module.

const TZ = 'Asia/Kathmandu';
const LOCALE = 'en-US';

type DateInput = Date | string | number;

function toDate(input: DateInput): Date {
  return input instanceof Date ? input : new Date(input);
}

/** "November 13, 2026" */
export function formatDateLong(input: DateInput): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(toDate(input));
}

/** "2:30 PM" */
export function formatTime(input: DateInput): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(toDate(input));
}

/** "November 13, 2026 at 2:30 PM" */
export function formatDateTime(input: DateInput): string {
  return `${formatDateLong(input)} at ${formatTime(input)}`;
}

/** "Friday, November 13, 2026" */
export function formatWeekdayLong(input: DateInput): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(toDate(input));
}

/** "Nov 13, 2026" */
export function formatDateShort(input: DateInput): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(toDate(input));
}

/** "Nov 13, 2026" with zero-padded day ("Nov 09, 2026") */
export function formatDatePadded(input: DateInput): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(toDate(input));
}


/**
 * Days between today and the target, computed in Asia/Kathmandu.
 * Deterministic on server and client: both anchor "today" to the same
 * calendar day in NPT, so the number does not depend on runtime timezone.
 * Negative = past.
 */
export function daysUntilNPT(input: DateInput): number {
  const target = toDate(input);
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const tzParts = (d: Date) => {
    const parts = fmt.format(d).split("-").map(Number);
    return Date.UTC(parts[0], parts[1] - 1, parts[2]);
  };
  return Math.round((tzParts(target) - tzParts(now)) / 86400000);
}

/** "in 3 days" | "tomorrow" | "today" | "yesterday" | "12 days ago" */
export function formatRelativeDay(input: DateInput): string {
  const d = daysUntilNPT(input);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d === -1) return "yesterday";
  if (d > 1) return "in " + d + " days";
  return Math.abs(d) + " days ago";
}
