import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";
import { isAdmin } from "@/app/lib/isAdmin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = await isAdmin(session.user.email);
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const rawIds = body?.ids;
  const action = body?.action;

  if (!Array.isArray(rawIds) || rawIds.length === 0 || rawIds.length > 100) {
    return NextResponse.json(
      { error: "ids must be a non-empty array (max 100)" },
      { status: 400 },
    );
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: "action must be approve or reject" },
      { status: 400 },
    );
  }

  const ids = rawIds
    .map((x: unknown) => Number(x))
    .filter((n) => Number.isFinite(n));

  if (ids.length === 0) {
    return NextResponse.json({ error: "No valid ids" }, { status: 400 });
  }

  if (action === "approve") {
    const { data: updated, error } = await supabase
      .from("products")
      .update({ approved: true })
      .in("id", ids)
      .select("id");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ approved: updated?.length || 0 });
  }

  // Delete comments first (FK from comments.product_id), then products.
  await supabase.from("comments").delete().in("product_id", ids);

  const { data: deleted, error } = await supabase
    .from("products")
    .delete()
    .in("id", ids)
    .select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rejected: deleted?.length || 0 });
}
