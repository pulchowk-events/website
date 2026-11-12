"use client";

import { useEffect, useState } from "react";
import { PostRow } from "@/app/components/shell/rows/PostRow";
import type { Post } from "@/app/api/lounge/posts/get/route";

export default function UserPosts({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/" + userId + "/posts");
        const data = await res.json();
        setPosts(data.posts || []);
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
          <div key={i} className="skeleton" style={{ height: 96 }} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="empty-row">
        <p>No posts yet.</p>
        {isOwner && (
          <a href="/lounge" className="btn btn--primary btn--sm">Write your first post</a>
        )}
      </div>
    );
  }

  return (
    <div className="row-list">
      {posts.map((p: any) => (
        <PostRow key={p.id} post={p} showThumb showExcerpt />
      ))}
    </div>
  );
}
