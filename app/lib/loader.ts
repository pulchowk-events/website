// app/lib/loader.ts
//
// Tiny global loader state manager.
// - Counter-based (handles concurrent fetches correctly)
// - Debounced show (avoids flash for fast ops <200ms)
// - Safety timeout (never stuck forever)
// - URL ignore list (don't flash on background polls)
//
// Not a React store — just plain JS so any code (even non-React)
// can trigger it. React components subscribe via useLoader() hook.

const IGNORED_URL_PATTERNS = [
  /\/api\/notifications/, // background poll every 15s
  /\/api\/auth\/session/, // NextAuth session check
  /\/api\/admin\/checkAdmin/, // admin status check on every page
  /\/_next\//, // Next.js internal chunks
];

const MIN_DELAY_BEFORE_SHOW = 800; // ms — don't show for fast ops
const MAX_LOADER_DURATION = 15000; // ms — force-hide if stuck

let pendingCount = 0;
let showTimer: ReturnType<typeof setTimeout> | null = null;
let safetyTimer: ReturnType<typeof setTimeout> | null = null;
let visible = false;

const listeners = new Set<(loading: boolean) => void>();

function notify() {
  listeners.forEach((fn) => fn(visible));
}

function startShowTimer() {
  if (showTimer) return;
  showTimer = setTimeout(() => {
    showTimer = null;
    if (pendingCount > 0) {
      visible = true;
      notify();
      // Safety net: if something never calls hideLoader, force-hide
      safetyTimer = setTimeout(() => {
        if (pendingCount > 0) {
          console.warn("[loader] Force-hiding stuck loader");
          pendingCount = 0;
          visible = false;
          notify();
        }
      }, MAX_LOADER_DURATION);
    }
  }, MIN_DELAY_BEFORE_SHOW);
}

function cancelShowTimer() {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (safetyTimer) {
    clearTimeout(safetyTimer);
    safetyTimer = null;
  }
}

export function showLoader() {
  pendingCount++;
  if (pendingCount === 1) {
    startShowTimer();
  }
}

export function hideLoader() {
  pendingCount = Math.max(0, pendingCount - 1);
  if (pendingCount === 0) {
    cancelShowTimer();
    if (visible) {
      visible = false;
      notify();
    }
  }
}

export function subscribeLoader(fn: (loading: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function isIgnoredUrl(url: string): boolean {
  return IGNORED_URL_PATTERNS.some((p) => p.test(url));
}

// Wrapper for one-shot async operations that aren't fetches
// (e.g. router.push, FileReader, etc.). Auto hides in finally.
export async function withLoader<T>(fn: () => Promise<T>): Promise<T> {
  showLoader();
  try {
    return await fn();
  } finally {
    hideLoader();
  }
}

export function getLoaderVisible(): boolean {
  return visible;
}
