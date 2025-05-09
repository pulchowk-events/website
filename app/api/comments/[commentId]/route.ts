// app/api/comments/[commentId]/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase'; // Regular supabase client (not auth client)

export async function DELETE(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  // Get session using NextAuth
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // First verify the comment exists and belongs to the user
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', params.commentId)
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
    .eq('id', params.commentId);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true },
    { status: 200 }
  );
}