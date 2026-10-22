import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data: post, error: postError } = await supabase
      .from("lounge_posts")
      .select("author_id")
      .eq("id", id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const adminCheck = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`,
    );
    const { isAdmin } = await adminCheck.json();

    if (!isAdmin && post.author_id !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to edit this post" },
        { status: 403 },
      );
    }

    const { title, content, category, redirect_url } = await request.json();

    if (!title?.trim() || !content?.trim() || !category) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const { data: updatedPost, error: updateError } = await supabase
      .from("lounge_posts")
      .update({
        title: title.trim(),
        content: content.trim(),
        category,
        redirect_url: redirect_url?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Server error:", error);
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
    if (!session?.user?.email || !session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data: post, error: fetchError } = await supabase
      .from("lounge_posts")
      .select("author_id")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const adminCheck = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`,
    );
    const { isAdmin } = await adminCheck.json();

    if (!isAdmin && post.author_id !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this post" },
        { status: 403 },
      );
    }

    const { error: commentsError } = await supabase
      .from("lounge_comments")
      .delete()
      .eq("post_id", id);

    if (commentsError) {
      console.error("Error deleting comments:", commentsError);
      return NextResponse.json(
        { error: "Failed to delete post comments" },
        { status: 500 },
      );
    }

    const { error: deleteError } = await supabase
      .from("lounge_posts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting post:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Post deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
