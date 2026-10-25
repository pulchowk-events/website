'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { User, Edit2, X, Trash2, LoaderCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CommentCardProps {
  comment: {
    id: number;
    comment: string;
    created_at: string;
    user_id: string;
  };
  isOwner: boolean;
  onDelete: (id: number) => Promise<void>;
}

export function CommentCard({ comment, isOwner, onDelete }: CommentCardProps) {
  const [userData, setUserData] = useState<{ name: string; image: string | null } | null>(null);
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  async function handleEdit() {
    if (!session) {
      toast.error('Please sign in to edit comments');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
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
    <div className="flex gap-4 p-4 rounded-lg bg-card/50 border border-border">
      <Link
        href={`/profile/${comment.user_id}`}
        className="hover:opacity-80 transition-opacity"
      >
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
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {userData?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={isUpdating}
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm disabled:opacity-50"
                  >
                    {isDeleting ? (<><Loader height={16} width={16}></Loader></>) : (<><Trash2 height={16} width={16}></Trash2></>)}
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
            className="mt-2 w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-green-500"
            rows={3}
          />
        ) : (
          <p className="mt-1 text-foreground">{comment.comment}</p>
        )}
      </div>
    </div>
  );
}