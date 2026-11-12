'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { User, Edit2, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  name: string;
  image: string | null;
}

interface CommentCardProps {
  comment: {
    id: number;
    comment: string;
    created_at: string;
    user_id: string;
    profiles?: {
      name?: string;
      image?: string | null;
      username?: string;
      avatar_url?: string;
    };
  };
  isOwner: boolean;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, nextText: string) => Promise<void>;
}

export function CommentCard({ comment, isOwner, onDelete, onUpdate }: CommentCardProps) {
  const hasInlineProfile =
    !!comment.profiles &&
    (comment.profiles.name !== undefined || comment.profiles.username !== undefined);

  const [userData, setUserData] = useState<Profile | null>(
    hasInlineProfile
      ? {
          name: comment.profiles?.name ?? comment.profiles?.username ?? 'Anonymous',
          image: comment.profiles?.image ?? comment.profiles?.avatar_url ?? null,
        }
      : null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (hasInlineProfile) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/users/' + comment.user_id);
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        if (!cancelled) setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasInlineProfile, comment.user_id]);

  useEffect(() => {
    setEditedComment(comment.comment);
  }, [comment.comment]);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleEdit() {
    const next = editedComment.trim();
    if (!next || next === comment.comment) {
      setIsEditing(false);
      return;
    }
    setIsUpdating(true);
    try {
      await onUpdate(comment.id, next);
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update comment');
    } finally {
      setIsUpdating(false);
    }
  }

  function cancelEdit() {
    setEditedComment(comment.comment);
    setIsEditing(false);
  }

  return (
    <div className="comment-card">
      <Link
        href={'/profile/' + comment.user_id}
        className="comment-card__avatar-link"
        aria-label={userData?.name || 'User'}
      >
        <span className="comment-card__avatar">
          {userData?.image ? (
            <Image
              src={userData.image}
              alt={userData.name || 'User'}
              width={36}
              height={36}
              className="comment-card__avatar-img"
            />
          ) : (
            <User size={18} />
          )}
        </span>
      </Link>

      <div className="comment-card__body">
        <header className="comment-card__head">
          <span className="comment-card__name">{userData?.name || 'Anonymous'}</span>
          <span className="comment-card__time" suppressHydrationWarning>
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>

          {isOwner && (
            <div className="comment-card__actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    aria-label="Cancel edit"
                    className="comment-card__icon-btn"
                  >
                    <X size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleEdit}
                    disabled={isUpdating}
                    className="comment-card__save-btn"
                  >
                    {isUpdating ? 'Saving…' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    aria-label="Edit comment"
                    className="comment-card__icon-btn"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    aria-label="Delete comment"
                    className="comment-card__icon-btn comment-card__icon-btn--danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          )}
        </header>

        {isEditing ? (
          <textarea
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            className="input input--multi comment-card__edit"
            rows={3}
          />
        ) : (
          <p className="comment-card__text">{comment.comment}</p>
        )}
      </div>
    </div>
  );
}
