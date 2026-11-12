import { cookies } from "next/headers";
import { LAYOUT_COOKIE, parseLayoutCookie, type LayoutPrefs } from "./preferences";

export async function readLayoutPrefs(): Promise<LayoutPrefs> {
  const store = await cookies();
  return parseLayoutCookie(store.get(LAYOUT_COOKIE)?.value);
}
