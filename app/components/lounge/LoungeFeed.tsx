"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LoungePostRow } from "./LoungePostRow";
import { LoungeComposer } from "./LoungeComposer";

interface Props {
  initialPosts: any[];
  totalCount: number;
  myVotes: Record<string, 1 | -1>;
  savedIds: string[];
  category: string;
  sort: "latest" | "top";
  density: "comfortable" | "compact";
  page: number;
  pageSize: number;
  userId?: string;
  isAdmin: boolean;
}

export function LoungeFeed({
  initialPosts,
  totalCount,
  myVotes,
  savedIds,
  category,
  sort,
  density,
  page,
  pageSize,
  userId,
  isAdmin,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [posts] = useState(initialPosts);
  const savedSet = new Set(savedIds);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const goPage = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    router.push(pathname + "?" + params.toString(), { scroll: true });
  };

  return (
    <>
      <LoungeComposer userId={userId} />

      {posts.length === 0 ? (
        <div className="empty-row" style={{ marginTop: 16 }}>
          <p>
            {category !== "all"
              ? "No posts in this category yet."
              : "No posts yet."}
          </p>
          {userId && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                const el = document.getElementById("lounge-composer") as HTMLTextAreaElement | null;
                el?.focus();
              }}
            >
              Write the first post
            </button>
          )}
        </div>
      ) : (
        <div className="lounge-list">
          {posts.map((p) => (
            <LoungePostRow
              key={p.id}
              post={p}
              myVote={myVotes[p.id]}
              saved={savedSet.has(p.id)}
              density={density}
              isOwner={userId === p.author_id}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="jobs-pager">
          <span className="jobs-pager__label">Page {page} of {totalPages}</span>
          <div className="jobs-pager__actions">
            <button
              type="button"
              onClick={() => goPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn btn--secondary btn--sm"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => goPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn btn--secondary btn--sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
