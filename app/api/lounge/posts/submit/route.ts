import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";
import { extractOgImage } from "@/app/lib/og-scraper";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in to submit a post" },
        { status: 401 },
      );
    }

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body - must be valid JSON" },
        { status: 400 },
      );
    }

    const { title, content, category, redirect_url, show_embed_image } =
      requestBody;

    if (!title || !content || !category) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            title: !title ? "Title is required" : null,
            content: !content ? "Content is required" : null,
            category: !category ? "Category is required" : null,
          },
        },
        { status: 400 },
      );
    }

    const trimmedRedirect = redirect_url?.trim() || null;
    const wantsImage = show_embed_image !== false && !!trimmedRedirect;

    // Only fetch the page if we're actually going to use the image
    let image_url: string | null = null;
    if (wantsImage && trimmedRedirect) {
      image_url = await extractOgImage(trimmedRedirect);
    }

    const postData = {
      title: title.trim(),
      content: content.trim(),
      category,
      author_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      redirect_url: trimmedRedirect,
      show_embed_image: show_embed_image !== false,
      image_url,
    };

    const { data: post, error: supabaseError } = await supabase
      .from("lounge_posts")
      .insert(postData)
      .select()
      .single();

    if (supabaseError) {
      console.error("Supabase error:", supabaseError);

      if (supabaseError.code === "23505") {
        return NextResponse.json(
          {
            error: "Duplicate post",
            details: "A similar post already exists",
          },
          { status: 409 },
        );
      }
      if (supabaseError.code === "23503") {
        return NextResponse.json(
          {
            error: "Invalid author",
            details: "Author not found in database",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          error: "Database error",
          details: supabaseError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Detailed error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
