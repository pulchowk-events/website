import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const postId = body?.postId;
  const value = body?.value;
  if (!postId || (value !== -1 && value !== 0 && value !== 1)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (value === 0) {
    const { error } = await supabase
      .from("post_votes")
      .delete()
      .eq("user_id", session.user.id)
      .eq("post_id", postId);
    if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  } else {
    const { error } = await supabase.from("post_votes").upsert(
      {
        user_id: session.user.id,
        post_id: postId,
        value,
      },
      { onConflict: "user_id,post_id" },
    );
    if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  const { data } = await supabase
    .from("lounge_posts")
    .select("score")
    .eq("id", postId)
    .single();

  revalidateTag("lounge", "max");
    return NextResponse.json({ score: data?.score ?? 0, value });
}
