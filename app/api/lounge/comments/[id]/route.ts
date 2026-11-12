import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const commentText = (body?.comment || "").trim();
  if (!commentText || commentText.length > 2000) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }

  const { data: comment } = await supabase
    .from("lounge_comments")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  if (comment.user_id !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { error } = await supabase
    .from("lounge_comments")
    .update({ comment: commentText, edited_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const { data: comment } = await supabase
    .from("lounge_comments")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  if (comment.user_id !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { error } = await supabase.from("lounge_comments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
