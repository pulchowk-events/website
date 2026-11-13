import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const confirm = String(body?.confirm ?? "").trim();
  const expected = session.user.email.trim().toLowerCase();
  if (confirm.toLowerCase() !== expected && confirm !== "DELETE") {
    return NextResponse.json(
      { error: "Type your email or DELETE to confirm" },
      { status: 400 },
    );
  }

  const userId = session.user.id;

  // 1. Gather content counts for the audit log
  const [
    { count: postCount },
    { count: commentCount },
    { count: productCount },
    { count: eventCount },
    { count: voteCount },
    { count: saveCount },
  ] = await Promise.all([
    supabase.from("lounge_posts").select("*", { count: "exact", head: true }).eq("author_id", userId),
    supabase.from("lounge_comments").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("posted_by", userId),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("created_by", userId),
    supabase.from("votes").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("saves").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  const summary = {
    posts: postCount ?? 0,
    comments: commentCount ?? 0,
    products: productCount ?? 0,
    events: eventCount ?? 0,
    votes: voteCount ?? 0,
    saves: saveCount ?? 0,
  };

  // 2. Write the deletion log BEFORE deleting anything
  const { error: logError } = await supabase.from("deleted_users").insert({
    original_user_id: userId,
    email: session.user.email,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    deleted_reason: "user_request",
    content_summary: summary,
  });

  if (logError) {
    console.error("deleted_users insert failed:", logError);
    return NextResponse.json({ error: "Could not record deletion" }, { status: 500 });
  }

  // 3. Reconnect lounge_comments children to grandparent before deleting
  //    (avoids orphaning other users' replies on threads you started)
  const { data: myComments } = await supabase
    .from("lounge_comments")
    .select("id, parent_id")
    .eq("user_id", userId);

  for (const c of myComments ?? []) {
    if (!c.parent_id) continue;
    await supabase
      .from("lounge_comments")
      .update({ parent_id: c.parent_id })
      .eq("parent_id", c.id);
  }

  // 4. Anonymise donations — keep row for ledger integrity
  await supabase
    .from("donations")
    .update({ name: "Anonymous" })
    .eq("user_id", userId);

  // 5. Delete content in FK-safe order (children first)
  const deletions = [
    ["notifications (source)", () => supabase.from("notifications").update({ source_user_id: null }).eq("source_user_id", userId)],
    ["notifications (own)", () => supabase.from("notifications").delete().eq("user_id", userId)],
    ["reports (as reviewer)", () => supabase.from("reports").update({ reviewed_by: null }).eq("reviewed_by", userId)],
    ["reports (as reporter)", () => supabase.from("reports").delete().eq("reported_by", userId)],
    ["post_votes", () => supabase.from("post_votes").delete().eq("user_id", userId)],
    ["votes (products)", () => supabase.from("votes").delete().eq("user_id", userId)],
    ["saves", () => supabase.from("saves").delete().eq("user_id", userId)],
    ["user_preferences", () => supabase.from("user_preferences").delete().eq("user_id", userId)],
    ["lounge_comments", () => supabase.from("lounge_comments").delete().eq("user_id", userId)],
    ["lounge_posts", () => supabase.from("lounge_posts").delete().eq("author_id", userId)],
    ["products", () => supabase.from("products").delete().eq("posted_by", userId)],
    ["events", () => supabase.from("events").delete().eq("created_by", userId)],
    ["users", () => supabase.from("users").delete().eq("id", userId)],
  ];

  for (const [label, fn] of deletions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (fn as any)();
    if (error) {
      console.error(`Deletion step failed [${label}]:`, error);
      return NextResponse.json(
        { error: `Deletion failed at ${label}. Contact support.`, step: label },
        { status: 500 },
      );
    }
  }

  // 6. Bust relevant caches
  for (const tag of ["products", "events", "lounge", "donations", "sidebar", "admin-status", "scholarships"]) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ success: true, summary });
}
