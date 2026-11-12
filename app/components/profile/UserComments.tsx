"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  post: { id: string; title: string };
}

export default function UserComments({ userId }: { userId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/" + userId + "/comments");
        const data = await res.json();
        setComments(data.comments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 92 }} />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="empty-row">
        <p>No comments yet.</p>
      </div>
    );
  }

  return (
    <div className="row-list">
      {comments.map((c) => (
        <div key={c.id} className="prof-comment">
          <Link href={"/lounge/" + c.post.id} className="prof-comment__post">
            <MessageSquare size={12} />
            {c.post.title}
          </Link>
          <p className="prof-comment__text">{c.comment}</p>
          <p className="prof-comment__time" suppressHydrationWarning>
            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
}
