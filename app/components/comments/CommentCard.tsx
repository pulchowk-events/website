// components/CommentCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { User } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface CommentCardProps {
  comment: {
    id: number;
    comment: string;
    created_at: string;
    user_id: string;
  };
  isOwner: boolean;
  onDelete: (id: number) => Promise<void>; // Changed to async
}

export function CommentCard({ comment, isOwner, onDelete }: CommentCardProps) {
  const [userData, setUserData] = useState<{ name: string; image: string | null } | null>(null);
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`/api/users/${comment.user_id}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    fetchUserData();
  }, [comment.user_id]);

  async function handleDelete() {
    if (!session) {
      toast.error('Please sign in to delete comments');
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete comment');
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-white/5 border border-zinc-800">
      <div className="flex-shrink-0">
        {userData?.image ? (
          <Image
            src={userData.image}
            alt={userData.name || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
            <User className="w-6 h-6 text-zinc-400" />
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-200">
              {userData?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-zinc-400">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
        
        <p className="mt-1 text-zinc-300">{comment.comment}</p>
      </div>
    </div>
  );
}