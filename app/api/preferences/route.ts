import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const patch: Record<string, unknown> = { user_id: session.user.id, updated_at: new Date().toISOString() };
  if (body.density === "comfortable" || body.density === "compact") patch.density = body.density;
  if (typeof body.sidebar_collapsed === "boolean") patch.sidebar_collapsed = body.sidebar_collapsed;
  if (Array.isArray(body.hidden_widgets)) patch.hidden_widgets = body.hidden_widgets;
  if (typeof body.profile_private === "boolean") patch.profile_private = body.profile_private;

  const { error } = await supabase
    .from("user_preferences")
    .upsert(patch, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
