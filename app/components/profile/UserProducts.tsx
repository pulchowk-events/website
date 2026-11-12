"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserProducts({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/" + userId + "/products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const visible = isOwner ? products : products.filter((p) => p.approved);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 88 }} />
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="empty-row">
        <p>No projects yet.</p>
        {isOwner && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => router.push("/product-hunt?showAddProduct=true")}
          >
            Submit a project
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="row-list">
      {visible.map((p: any) => (
        <div key={p.id} className="prof-product">
          <a href={"/product-hunt/" + p.url} className="prof-product__body">
            <p className="row-title">{p.name}</p>
            {p.description && <p className="row-excerpt row-excerpt--single">{p.description}</p>}
            <div className="row-meta">
              <span>{p.votes ?? 0} votes</span>
            </div>
          </a>
          {!p.approved && <span className="prof-product__badge">Pending review</span>}
        </div>
      ))}
    </div>
  );
}
