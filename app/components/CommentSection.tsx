'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../lib/supabase';
import { CommentCard } from './CommentCard';
import { toast } from 'sonner';

interface CommentsProps {
  productId: number;
}

export function Comments({ productId }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [productId]);

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (data) setComments(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('comments').insert({
        comment: newComment.trim(),
        product_id: productId,
        user_id: session.user.id
      });

      if (error) throw error;

      toast.success('Comment added successfully');
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: number) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comment deleted');
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  }

  return (
    <div className="mt-12 ">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            isOwner={session?.user?.id === comment.user_id}
            onDelete={handleDelete}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-center text-zinc-400 py-8">No comments yet. Be the first to comment!</p>
        )}

         <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={session ? "Add a comment..." : "Sign in to comment"}
          disabled={!session || isSubmitting}
          className="w-full p-4 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 transition"
          rows={3}
        />
        {session && (
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-md text-white font-medium transition"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        )}
      </form>
      </div>

           
    </div>
  );
}