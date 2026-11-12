'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  post: {
    id: string;
    title: string;
  };
}

export default function UserComments({ userId }: { userId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch('/api/users/' + userId + '/comments');
        const data = await response.json();
        setComments(data.comments);
      } catch (error) {
        console.error('Error fetching user comments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 92 }} />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No comments yet.</p>
        <p className="empty-state__desc">This user hasn&apos;t replied to anything in the lounge.</p>
      </div>
    );
  }

  return (
    <ul className="user-comments">
      {comments.map((comment) => (
        <li key={comment.id} className="user-comments__item">
          <Link
            href={'/lounge/' + comment.post.id}
            className="user-comments__link"
          >
            <MessageSquare size={12} />
            <span className="user-comments__post-title">{comment.post.title}</span>
          </Link>
          <p className="user-comments__text">{comment.comment}</p>
          <p className="user-comments__time" suppressHydrationWarning>
            {formatDistanceToNow(new Date(comment.created_at))} ago
          </p>
        </li>
      ))}
    </ul>
  );
}
