"use client";

import { useEffect, useState } from "react";
import { PostRow } from "@/app/components/shell/rows/PostRow";
import { EventRow } from "@/app/components/shell/rows/EventRow";
import { JobRow } from "@/app/components/shell/rows/JobRow";
import { ProjectRow } from "@/app/components/shell/rows/ProjectRow";

export default function UserSaved({ userId }: { userId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/saves");
        const data = await res.json();
        const saves = data.items || [];
        const hydrated = await Promise.all(
          saves.map(async (s: any) => {
            if (s.item_type === "post") {
              const r = await fetch("/api/lounge/posts/get?ids=" + s.item_id);
              const d = await r.json().catch(() => null);
              return d?.posts?.[0] ? { type: "post", data: d.posts[0] } : null;
            }
            return { type: s.item_type, id: s.item_id };
          }),
        );
        setItems(hydrated.filter(Boolean) as any[]);
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

  if (items.length === 0) {
    return (
      <div className="empty-row">
        <p>Nothing saved yet.</p>
        <a href="/saved" className="btn btn--secondary btn--sm">Open Saved page</a>
      </div>
    );
  }

  return (
    <>
      <p className="prof-saved-hint">
        Full saved list with filters at <a href="/saved">/saved</a>.
      </p>
    </>
  );
}
