import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const postId = url.searchParams.get("post_id");
  if (!postId) return NextResponse.json({ error: "post_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("lounge_comments")
    .select("id, comment, post_id, user_id, parent_id, depth, created_at, updated_at, edited_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = Array.from(new Set((data || []).map((c) => c.user_id)));
  let profiles: Record<string, { name: string | null; image: string | null }> = {};
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, name, image")
      .in("id", userIds);
    profiles = Object.fromEntries((users || []).map((u) => [u.id, { name: u.name, image: u.image }]));
  }

  const comments = (data || []).map((c) => ({
    ...c,
    profiles: profiles[c.user_id] || null,
  }));

  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const postId = body?.post_id;
  const commentText = (body?.comment || "").trim();
  const parentId = body?.parent_id || null;

  if (!postId) return NextResponse.json({ error: "post_id required" }, { status: 400 });
  if (!commentText) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  if (commentText.length > 2000) {
    return NextResponse.json({ error: "Comment too long" }, { status: 400 });
  }

  let depth = 0;
  let effectiveParentId = parentId;

  if (parentId) {
    const { data: parent } = await supabase
      .from("lounge_comments")
      .select("id, parent_id, depth, post_id")
      .eq("id", parentId)
      .single();

    if (!parent || parent.post_id !== postId) {
      return NextResponse.json({ error: "Parent comment invalid" }, { status: 400 });
    }

    if (parent.depth >= 2) {
      effectiveParentId = parent.parent_id;
      depth = 2;
    } else {
      depth = parent.depth + 1;
    }
  }

  const { data: inserted, error } = await supabase
    .from("lounge_comments")
    .insert({
      post_id: postId,
      user_id: session.user.id,
      comment: commentText,
      parent_id: effectiveParentId,
      depth,
    })
    .select("id, comment, post_id, user_id, parent_id, depth, created_at, updated_at, edited_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = {
    ...inserted,
    profiles: {
      name: session.user.name || null,
      image: session.user.image || null,
    },
  };

  return NextResponse.json(enriched, { status: 201 });
}
