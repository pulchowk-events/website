// Pure cookie helpers. Safe to import from client components.
// Server-only reading lives in preferences.server.ts.

export interface LayoutPrefs {
  sidebarCollapsed: boolean;
  density: "comfortable" | "compact";
}

export const LAYOUT_COOKIE = "pe_layout";

export function parseLayoutCookie(raw: string | undefined): LayoutPrefs {
  if (!raw) return { sidebarCollapsed: false, density: "comfortable" };
  try {
    const decoded = decodeURIComponent(raw);
    const parts = decoded.split(":");
    return {
      sidebarCollapsed: parts[0] === "1",
      density: parts[1] === "compact" ? "compact" : "comfortable",
    };
  } catch {
    return { sidebarCollapsed: false, density: "comfortable" };
  }
}

export function serializeLayoutCookie(prefs: LayoutPrefs): string {
  return encodeURIComponent(
    (prefs.sidebarCollapsed ? "1" : "0") + ":" + prefs.density,
  );
}

export function writeLayoutPrefsClient(prefs: LayoutPrefs) {
  document.cookie =
    LAYOUT_COOKIE +
    "=" +
    serializeLayoutCookie(prefs) +
    "; path=/; max-age=" +
    60 * 60 * 24 * 365 +
    "; samesite=lax";
}
