'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LoungeCommentCard } from './LoungeCommentCard';
import { toast } from 'sonner';

interface Comment {
  id: string;
  comment: string;
  post_id: string;
  user_id: string;
  created_at: string;
  profiles?: {
    name: string;
    image: string | null;
  };
}

interface LoungeCommentsProps {
  postId: string;
}

export function LoungeComments({ postId }: LoungeCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function fetchComments() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/lounge/comments?post_id=' + postId);
      if (!response.ok) throw new Error('Failed to fetch comments');
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
      const response = await fetch('/api/lounge/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newComment.trim(), post_id: postId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }
      const newCommentData = await response.json();
      setComments((prev) => [newCommentData, ...prev]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    const response = await fetch('/api/lounge/comments/' + commentId, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete comment');
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    toast.success('Comment deleted');
  }

  async function handleUpdate(commentId: string, nextText: string) {
    const response = await fetch('/api/lounge/comments/' + commentId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: nextText }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update comment');
    }
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, comment: nextText } : c))
    );
    toast.success('Comment updated successfully');
  }

  return (
    <section className="comments">
      <h2 className="comments__title">
        Comments{comments.length > 0 ? ' · ' + comments.length : ''}
      </h2>

      <form onSubmit={handleSubmit} className="comments__form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={session ? 'Add a comment…' : 'Sign in to comment'}
          disabled={!session || isSubmitting}
          className="input input--multi"
          rows={3}
        />
        {session && (
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="btn btn--primary"
          >
            <span className="btn__label">
              {isSubmitting ? 'Posting…' : 'Post comment'}
            </span>
            <span className="btn__label btn__label--dup" aria-hidden="true">
              {isSubmitting ? 'Posting…' : 'Post comment'}
            </span>
          </button>
        )}
      </form>

      {isLoading ? (
        <div className="comments__list">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 88 }} />
          ))}
        </div>
      ) : comments.length > 0 ? (
        <ul className="comments__list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <LoungeCommentCard
                comment={comment}
                profiles={comment.profiles}
                isOwner={session?.user?.id === comment.user_id}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p className="empty-state__title">No comments yet.</p>
          <p className="empty-state__desc">Be the first to reply.</p>
        </div>
      )}
    </section>
  );
}
