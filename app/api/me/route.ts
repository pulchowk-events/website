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

  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (name.length === 0 || name.length > 60) {
      return NextResponse.json({ error: "Name must be 1-60 characters" }, { status: 400 });
    }
    patch.name = name;
  }
  if (typeof body.bio === "string") {
    const bio = body.bio.trim();
    if (bio.length > 160) {
      return NextResponse.json({ error: "Bio must be 160 characters or fewer" }, { status: 400 });
    }
    patch.bio = bio || null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .update(patch)
    .eq("id", session.user.id)
    .select("id, name, bio")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, user: data });
}
