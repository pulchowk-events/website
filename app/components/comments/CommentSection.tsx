'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CommentCard } from './CommentCard';
import { toast } from 'sonner';

interface Comment {
  id: number;
  comment: string;
  product_id: number;
  user_id: string;
  created_at: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
}

interface CommentsProps {
  productId: number;
}

export function Comments({ productId }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [productId]);

  async function fetchComments() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/comments?product_id=${productId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
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
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newComment.trim(),
          product_id: productId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }

      const newCommentData = await response.json();
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to add comment'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: number) {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete comment'
      );
    }
  }

  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Comments</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Comments</h2>

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
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </p>
        )}

        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={session ? "Add a comment..." : "Sign in to comment"}
            disabled={!session || isSubmitting}
            className="w-full p-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:ring focus:ring-green-500 transition"
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