import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { comment } = await request.json();

    if (!comment?.trim()) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 },
      );
    }

    const { data: existingComment } = await supabase
      .from("lounge_comments")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingComment || existingComment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to edit this comment" },
        { status: 403 },
      );
    }

    const { data: updatedComment, error } = await supabase
      .from("lounge_comments")
      .update({
        comment: comment.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update comment" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Comment update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data: existingComment } = await supabase
      .from("lounge_comments")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const adminCheck = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email!)}`,
    );
    const { isAdmin } = await adminCheck.json();

    if (!isAdmin && existingComment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this comment" },
        { status: 403 },
      );
    }

    const { error } = await supabase
      .from("lounge_comments")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete comment" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Comment deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
