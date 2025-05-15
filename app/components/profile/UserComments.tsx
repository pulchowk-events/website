'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
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
        const response = await fetch(`/api/users/${userId}/comments`);
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
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        No comments yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div 
          key={comment.id}
          className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4"
        >
          <Link 
            href={`/lounge/${comment.post.id}`}
            className="text-sm text-zinc-400 hover:text-zinc-300 mb-2 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            on: {comment.post.title}
          </Link>
          <p className="text-zinc-200">{comment.comment}</p>
          <div className="mt-2 text-xs text-zinc-500">
            {formatDistanceToNow(new Date(comment.created_at))} ago
          </div>
        </div>
      ))}
    </div>
  );
}