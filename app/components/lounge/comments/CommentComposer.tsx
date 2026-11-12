"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  postId: string;
  parentId?: string;
  parentAuthor?: string;
  compact?: boolean;
  onPosted: (comment: any, parentId?: string) => void;
  onCancel?: () => void;
  session: { id?: string; name?: string | null; image?: string | null } | null;
}

export function CommentComposer({
  postId, parentId, parentAuthor, compact = false, onPosted, onCancel, session,
}: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  if (!session?.id) {
    return (
      <p className="comment-composer__guest">
        <a href="/auth/signin">Sign in</a> to comment.
      </p>
    );
  }

  const submit = async () => {
    const text = value.trim();
    if (!text || pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/lounge/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          parent_id: parentId || null,
          comment: text,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      setValue("");
      setFocused(false);
      onPosted(data, parentId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setPending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape" && onCancel) onCancel();
  };

  const showExpanded = focused || value.length > 0;

  return (
    <div className={"comment-composer" + (showExpanded ? " comment-composer--expanded" : "") + (compact ? " comment-composer--compact" : "")}>
      <textarea
        ref={ref}
        className="comment-composer__input"
        placeholder={
          parentAuthor ? "Reply to @" + parentAuthor + "…" : "Add a comment…"
        }
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, 2000))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKey}
        rows={showExpanded ? 3 : 1}
        maxLength={2000}
        disabled={pending}
      />
      {showExpanded && (
        <div className="comment-composer__bar">
          <span className="comment-composer__count">{value.length} / 2000</span>
          <div className="comment-composer__actions">
            {onCancel && (
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={onCancel}
                disabled={pending}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={submit}
              disabled={pending || !value.trim()}
            >
              {pending ? "Posting…" : parentId ? "Reply" : "Comment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
