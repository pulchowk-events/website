import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';
import { insertNotification } from '@/lib/notifications';



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    // chek on this if error

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const { data: comments, error } = await supabase
      .from('lounge_comments')
      .select(`
        *,
        users:user_id (
          name,
          image
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json(comments || []);

  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { comment, post_id } = await request.json();

    if (!comment?.trim() || !post_id) {
      return NextResponse.json({
        error: 'Comment text and post ID are required'
      }, { status: 400 });
    }

    const { data: newComment, error } = await supabase
      .from('lounge_comments')
      .insert({
        comment: comment.trim(),
        post_id,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        users:user_id (
          name,
          image
        )
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

        // For post comments
    if (post_id) {
      const { data: post } = await supabase
        .from('lounge_posts')
        .select('author_id, title')
        .eq('id', post_id)
        .single();

      if (post) {
        await insertNotification(supabase, {
          user_id: post.author_id,
          type: 'post_comment',
          title: `${session.user.name} commented on your post "${post.title}"`,
          link: `/lounge/${post_id}`,
          source_user_id: session.user.id
        });
      }
    }

    // confused if session.user.name actually; works could be undefined

    return NextResponse.json(newComment);

  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}