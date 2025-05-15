import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { data: posts, error } = await supabase
      .from('lounge_posts')
      .select(`
        *,
        users:author_id (
          name,
          image
        )
      `)
      .eq('author_id', params.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
}