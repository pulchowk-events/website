import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { PostCategory } from '@/types/posts';

export const dynamic = 'force-dynamic';

export interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  created_at: string;
  redirect_url: string | null;
  author_id: string;
  users: {
    name: string;
    image: string | null;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const { count } = await supabase
      .from('lounge_posts')
      .select('*', { count: 'exact' });

    // Fetch posts with author info
    const { data: posts, error } = await supabase
      .from('lounge_posts')
      .select(`
        *,
        users:author_id (
          name,
          image
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      posts: posts || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}