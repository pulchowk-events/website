import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  // Retrieve the commentId from params
  const { commentId } = params;

  // Get session using NextAuth
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Verify the comment exists and belongs to the user
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single();

  if (commentError || !comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    );
  }

  if (comment.user_id !== session.user.id) {
    return NextResponse.json(
      { error: 'Not authorized to delete this comment' },
      { status: 403 }
    );
  }

  // Delete the comment
  const { error: deleteError } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}


export async function PUT(
  request: NextRequest,
  context: { params: { commentId: string } }
) {
  const { commentId } = context.params;
  
  // Rest of your PUT handler remains the same
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { comment: newComment } = await request.json();

    if (!newComment || typeof newComment !== 'string') {
      return NextResponse.json(
        { error: 'Invalid comment content' },
        { status: 400 }
      );
    }

    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this comment' },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase
      .from('comments')
      .update({ comment: newComment })
      .eq('id', commentId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, comment: newComment },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}