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
  const ids = body?.ids;
  const action = body?.action;

  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) {
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

  if (action === "approve") {
    const { data: updated, error } = await supabase
      .from("events")
      .update({ verified: true })
      .in("id", ids)
      .select("id");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ approved: updated?.length || 0 });
  }

  const { data: deleted, error } = await supabase
    .from("events")
    .delete()
    .in("id", ids)
    .select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rejected: deleted?.length || 0 });
}
