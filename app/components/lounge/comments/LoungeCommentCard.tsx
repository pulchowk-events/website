'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { User, Edit2, X, Trash2, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface LoungeCommentCardProps {
  comment: {
    id: string;
    comment: string;
    created_at: string;
    user_id: string;
  };
  isOwner: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function LoungeCommentCard({ comment, isOwner, onDelete }: LoungeCommentCardProps) {
  const [userData, setUserData] = useState<{ name: string; image: string | null } | null>(null);
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleDelete() {
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

  async function handleEdit() {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/lounge/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: editedComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      toast.success('Comment updated successfully');
      setIsEditing(false);
      // Update the local comment state
      comment.comment = editedComment;
    } catch (error) {
      console.error('Error updating comment:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update comment');
      }
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
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
            <span className="font-medium text-white">
              {userData?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-zinc-400">
              {formatDistanceToNow(new Date(comment.created_at))} ago
            </span>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-zinc-400 hover:text-zinc-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={isUpdating}
                    className="text-green-400 hover:text-green-300 disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <textarea
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            className="mt-2 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-green-500"
            rows={3}
          />
        ) : (
          <p className="mt-1 text-zinc-300">{comment.comment}</p>
        )}
      </div>
    </div>
  );
}