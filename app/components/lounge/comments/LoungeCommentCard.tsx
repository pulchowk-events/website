"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Edit2, X, Trash2, CornerDownRight, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { CommentComposer } from "./CommentComposer";
import { Avatar } from "@/app/components/ui/Avatar";

export interface CommentNode {
  id: string;
  comment: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  depth: number;
  created_at: string;
  updated_at: string | null;
  edited_at: string | null;
  profiles?: { name: string | null; image: string | null } | null;
  pending?: boolean;
  children: CommentNode[];
}

interface Props {
  comment: CommentNode;
  postId: string;
  session: { id?: string; name?: string | null; image?: string | null } | null;
  onPosted: (comment: any, parentId?: string) => void;
  onUpdate: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function LoungeCommentCard({ comment, postId, session, onPosted, onUpdate, onDelete }: Props) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.comment);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isOwner = session?.id === comment.user_id;
  const author = comment.profiles?.name || "Anonymous";
  const childCount = comment.children.length;

  const saveEdit = async () => {
    const next = editedText.trim();
    if (!next || next === comment.comment) {
      setEditing(false);
      setEditedText(comment.comment);
      return;
    }
    setUpdating(true);
    try {
      await onUpdate(comment.id, next);
      setEditing(false);
    } catch {
      toast.error("Could not update");
    } finally {
      setUpdating(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await onDelete(comment.id);
    } catch {
      toast.error("Could not delete");
    } finally {
      setDeleting(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditedText(comment.comment);
  };

  return (
    <div className={"comment-node" + (comment.pending ? " comment-node--pending" : "")} data-depth={comment.depth}>
      <div className="comment-node__inner">
        <Link href={"/profile/" + comment.user_id} className="comment-node__avatar-link">
          <span className="comment-node__avatar">
            <Avatar src={comment.profiles?.image} name={author} size={24} />
          </span>
        </Link>

        <div className="comment-node__body">
          <div className="comment-node__head">
            <span className="comment-node__author">{author}</span>
            <span className="comment-node__time" suppressHydrationWarning>
              {comment.pending ? "Sending…" : formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.edited_at && <span className="comment-node__edited">edited</span>}
          </div>

          {editing ? (
            <div className="comment-node__edit-wrap">
              <textarea
                className="comment-node__edit"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={3}
                maxLength={2000}
              />
              <div className="comment-node__edit-actions">
                <button type="button" onClick={cancelEdit} className="btn btn--secondary btn--sm" disabled={updating}>Cancel</button>
                <button type="button" onClick={saveEdit} className="btn btn--primary btn--sm" disabled={updating}>
                  {updating ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="comment-node__text">{comment.comment}</p>
          )}

          {!editing && !comment.pending && (
            <div className="comment-node__actions">
              <button
                type="button"
                className="comment-node__action"
                onClick={() => setReplying((v) => !v)}
              >
                <CornerDownRight size={12} /> Reply
              </button>
              {isOwner && (
                <>
                  <button type="button" className="comment-node__action" onClick={() => setEditing(true)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="comment-node__action comment-node__action--danger"
                    onClick={remove}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                </>
              )}
              {childCount > 0 && (
                <button
                  type="button"
                  className="comment-node__action comment-node__action--toggle"
                  onClick={() => setCollapsed((v) => !v)}
                >
                  {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  {collapsed ? childCount + " replies hidden" : "Hide replies"}
                </button>
              )}
            </div>
          )}

          {replying && (
            <div className="comment-node__reply">
              <CommentComposer
                postId={postId}
                parentId={comment.id}
                parentAuthor={author}
                compact
                session={session}
                onPosted={onPosted}
                onCancel={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {!collapsed && comment.children.length > 0 && (
        <div className="comment-node__children">
          {comment.children.map((child) => (
            <LoungeCommentCard
              key={child.id}
              comment={child}
              postId={postId}
              session={session}
              onPosted={onPosted}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
