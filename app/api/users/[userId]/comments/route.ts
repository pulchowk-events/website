import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    const { data: comments, error } = await supabase
      .from("lounge_comments")
      .select(
        `
        *,
        post:post_id (
          id,
          title
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error("Error fetching user comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch user comments" },
      { status: 500 },
    );
  }
}
