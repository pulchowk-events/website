"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CommentComposer } from "./CommentComposer";
import { LoungeCommentCard, type CommentNode } from "./LoungeCommentCard";

interface Props {
  postId: string;
}

type Sort = "old" | "new";

function buildTree(flat: any[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  for (const c of flat) {
    map.set(c.id, { ...c, children: [] });
  }
  const roots: CommentNode[] = [];
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function sortTree(nodes: CommentNode[], sort: Sort): CommentNode[] {
  const copy = [...nodes];
  copy.sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    return sort === "old" ? ta - tb : tb - ta;
  });
  for (const n of copy) {
    n.children = sortTree(n.children, sort);
  }
  return copy;
}

export function LoungeComments({ postId }: Props) {
  const { data: session } = useSession();
  const [flat, setFlat] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState<Sort>("old");

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function fetchComments() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/lounge/comments?post_id=" + postId);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setFlat(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }

  const handlePosted = (comment: any, parentId?: string) => {
    setFlat((prev) => [...prev, { ...comment, parent_id: parentId || null }]);
  };

  const handleUpdate = async (id: string, text: string) => {
    const res = await fetch("/api/lounge/comments/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: text }),
    });
    if (!res.ok) throw new Error();
    setFlat((prev) =>
      prev.map((c) => (c.id === id ? { ...c, comment: text, edited_at: new Date().toISOString() } : c)),
    );
    toast.success("Comment updated");
  };

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/lounge/comments/" + id, { method: "DELETE" });
    if (!res.ok) throw new Error();
    setFlat((prev) => prev.filter((c) => c.id !== id && c.parent_id !== id));
    toast.success("Comment deleted");
  };

  const roots = sortTree(buildTree(flat), sort);
  const count = flat.length;

  return (
    <section className="comments">
      <header className="comments__head">
        <h2 className="comments__title">
          Comments{count > 0 ? " · " + count : ""}
        </h2>
        {count > 1 && (
          <div className="seg">
            <button
              type="button"
              className={"seg__item" + (sort === "old" ? " seg__item--on" : "")}
              onClick={() => setSort("old")}
            >
              Old
            </button>
            <button
              type="button"
              className={"seg__item" + (sort === "new" ? " seg__item--on" : "")}
              onClick={() => setSort("new")}
            >
              New
            </button>
          </div>
        )}
      </header>

      <CommentComposer
        postId={postId}
        session={session?.user ? { id: session.user.id, name: session.user.name, image: session.user.image } : null}
        onPosted={handlePosted}
      />

      {isLoading ? (
        <div className="comments__list">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 8 }} />
          ))}
        </div>
      ) : count === 0 ? (
        <p className="comments__empty">No comments yet. Start the conversation.</p>
      ) : (
        <div className="comments__list">
          {roots.map((node) => (
            <LoungeCommentCard
              key={node.id}
              comment={node}
              postId={postId}
              session={session?.user ? { id: session.user.id, name: session.user.name, image: session.user.image } : null}
              onPosted={handlePosted}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
