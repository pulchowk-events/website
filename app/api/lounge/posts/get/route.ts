import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { PostCategory } from "@/types/posts";

export const dynamic = "force-dynamic";

// Only the type at the top changes:
export interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  created_at: string;
  redirect_url: string | null;
  image_url: string | null; // NEW
  show_embed_image: boolean; // NEW
  author_id: string;
  users: {
    name: string;
    image: string | null;
    id: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const categories =
      searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const offset = (page - 1) * limit;

    let query = supabase.from("lounge_posts").select(
      `
        *,
        users:author_id (
          name,
          image,
          id
        )
      `,
      { count: "exact" },
    );

    // Add category filter if categories are selected
    if (categories.length > 0) {
      query = query.in("category", categories);
    }

    // Get the final results with pagination
    const {
      data: posts,
      error,
      count,
    } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      posts: posts || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
