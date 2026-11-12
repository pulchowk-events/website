import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";

const VALID_TYPES = ["post", "event", "job", "project", "scholarship"] as const;
type ItemType = typeof VALID_TYPES[number];

export const dynamic = "force-dynamic";

async function auth() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function PUT(request: Request) {
  const userId = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const item_type = body?.item_type;
  const item_id = body?.item_id;
  if (!item_type || !item_id || !VALID_TYPES.includes(item_type as ItemType)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saves")
    .upsert(
      { user_id: userId, item_type, item_id },
      { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true },
    );

  if (error) {
    console.error("saves PUT error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(request: Request) {
  const userId = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const item_type = body?.item_type;
  const item_id = body?.item_id;
  if (!item_type || !item_id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saves")
    .delete()
    .eq("user_id", userId)
    .eq("item_type", item_type)
    .eq("item_id", item_id);

  if (error) {
    console.error("saves DELETE error:", error);
    return NextResponse.json({ error: "Failed to unsave" }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}

export async function GET(request: Request) {
  const userId = await auth();
  if (!userId) return NextResponse.json({ items: [] });

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  let q = supabase
    .from("saves")
    .select("item_type, item_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (type && VALID_TYPES.includes(type as ItemType)) q = q.eq("item_type", type);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}
