import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabase } from "./supabase";
import { LAYOUT_COOKIE, parseLayoutCookie, type LayoutPrefs } from "./preferences";

export async function readLayoutPrefs(): Promise<LayoutPrefs> {
  const store = await cookies();
  const raw = store.get(LAYOUT_COOKIE)?.value;
  if (raw) return parseLayoutCookie(raw);

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const { data } = await supabase
      .from("user_preferences")
      .select("density, sidebar_collapsed")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (data) {
      return {
        sidebarCollapsed: !!data.sidebar_collapsed,
        density: data.density === "compact" ? "compact" : "comfortable",
      };
    }
  }
  return parseLayoutCookie(undefined);
}

export async function getHiddenWidgets(userId: string | undefined): Promise<string[]> {
  if (!userId) return [];
  const { data } = await supabase
    .from("user_preferences")
    .select("hidden_widgets")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.hidden_widgets || [];
}
