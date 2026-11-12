import { cookies } from "next/headers";

export interface LayoutPrefs {
  sidebarCollapsed: boolean;
  density: "comfortable" | "compact";
}

const COOKIE_NAME = "pe_layout";

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

export async function readLayoutPrefs(): Promise<LayoutPrefs> {
  const store = await cookies();
  return parseLayoutCookie(store.get(COOKIE_NAME)?.value);
}

export function writeLayoutPrefsClient(prefs: LayoutPrefs) {
  document.cookie =
    COOKIE_NAME +
    "=" +
    serializeLayoutCookie(prefs) +
    "; path=/; max-age=" +
    60 * 60 * 24 * 365 +
    "; samesite=lax";
}

export const LAYOUT_COOKIE = COOKIE_NAME;
