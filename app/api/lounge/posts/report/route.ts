import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin status
    const { data: adminData } = await supabase
      .from('admins')
      .select('email')
      .eq('email', session.user.email)
      .single();

    if (!adminData) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Fetch reports with post and user details
    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        *,
        post:post_id (
          id,
          title,
          content,
          author:author_id (
            name,
            email
          )
        ),
        reporter:reported_by (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ reports });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, type, reason } = await request.json();

    if (!postId || !type || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('lounge_posts')
      .select('id, author_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Don't allow reporting your own post
    if (post.author_id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot report your own post' },
        { status: 400 }
      );
    }

    // Check for duplicate reports
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('post_id', postId)
      .eq('reported_by', session.user.id)
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this post' },
        { status: 400 }
      );
    }

    // Create report
    const { error: reportError } = await supabase
      .from('reports')
      .insert({
        post_id: postId,
        reported_by: session.user.id,
        type,
        reason,
        status: 'pending'
      });

    if (reportError) {
      throw reportError;
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}