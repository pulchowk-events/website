"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ExternalLink, User, Calendar, Check } from "lucide-react";
import { formatDatePadded } from "@/app/lib/formatDate";
import { toast } from "sonner";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  votes: number;
  created_at: string;
  approved: boolean;
  posted_by: string;
  image_url: string | null;
}

export default function PendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    fetchPendingProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPendingProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/products/pending");
      if (!res.ok) throw new Error("Failed to fetch products");
      const { products, usernames } = await res.json();
      setProducts(products);
      setUsernames(usernames);
      setSelected(new Set());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pending products");
    } finally {
      setLoading(false);
    }
  }

  async function handleProductApproval(id: number, approved: boolean) {
    try {
      setProcessing((prev) => ({ ...prev, [id]: true }));
      const res = await fetch("/api/products/pending/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, approved }),
      });
      if (!res.ok) throw new Error(approved ? "Failed to approve" : "Failed to reject");
      toast.success(approved ? "Product approved" : "Product rejected");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function bulkAction(action: "approve" | "reject") {
    if (selected.size === 0) return;
    setBulkProcessing(action);
    try {
      const res = await fetch("/api/admin/products/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(
        action === "approve"
          ? `Approved ${data.approved ?? selected.size} product${(data.approved ?? selected.size) === 1 ? "" : "s"}`
          : `Rejected ${data.rejected ?? selected.size} product${(data.rejected ?? selected.size) === 1 ? "" : "s"}`,
      );
      const removed = new Set(selected);
      setProducts((prev) => prev.filter((p) => !removed.has(p.id)));
      setSelected(new Set());
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      setBulkProcessing(null);
    }
  }

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  }

  if (loading) {
    return (
      <div className="admin-pending-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 240, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No pending products.</p>
        <p className="empty-state__desc">Every submitted project has been reviewed.</p>
      </div>
    );
  }

  const allSelected = selected.size === products.length && products.length > 0;

  return (
    <div>
      <div className="admin-select-all">
        <button
          type="button"
          className="admin-checkbox"
          data-checked={allSelected ? "true" : "false"}
          onClick={toggleAll}
          aria-label={allSelected ? "Deselect all" : "Select all"}
        >
          <Check size={12} />
        </button>
        <span>
          {selected.size > 0
            ? `${selected.size} of ${products.length} selected`
            : `${products.length} pending product${products.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="admin-pending-grid">
        {products.map((product) => (
          <article key={product.id} className="admin-pending__card">
            <div className="admin-pending__body" style={{ padding: 16 }}>
              <div className="admin-product-row">
                <div className="admin-pending__check">
                  <button
                    type="button"
                    className="admin-checkbox"
                    data-checked={selected.has(product.id) ? "true" : "false"}
                    onClick={() => toggle(product.id)}
                    aria-label={selected.has(product.id) ? "Deselect" : "Select"}
                  >
                    <Check size={12} />
                  </button>
                </div>

                <div className="admin-product-row__media">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="96px"
                      className="admin-product-row__img"
                    />
                  ) : (
                    <span className="admin-pending__no-img">No image</span>
                  )}
                </div>

                <div className="admin-product-row__text">
                  <div className="admin-product-row__head">
                    <h3 className="admin-pending__title" style={{ fontSize: 15 }}>
                      {product.name}
                    </h3>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-pending__link"
                      aria-label={"Open " + product.name}
                      style={{ margin: 0, flexShrink: 0 }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  <div className="admin-pending__meta">
                    <span className="admin-pending__meta-item">
                      <User size={12} />
                      <span className="admin-pending__truncate">
                        {usernames[product.posted_by] || "Unknown user"}
                      </span>
                    </span>
                    <span className="admin-pending__meta-item">
                      <Calendar size={12} />
                      {formatDatePadded(product.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="admin-pending__desc" style={{ marginTop: 12 }}>
                {product.description}
              </p>
            </div>

            <footer className="admin-pending__foot">
              <button
                type="button"
                onClick={() => handleProductApproval(product.id, false)}
                disabled={!!processing[product.id] || !!bulkProcessing}
                className="btn btn--secondary"
                style={{ color: "var(--danger)" }}
              >
                <XCircle size={14} style={{ marginRight: 6 }} />
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleProductApproval(product.id, true)}
                disabled={!!processing[product.id] || !!bulkProcessing}
                className="btn btn--primary"
              >
                <CheckCircle size={14} style={{ marginRight: 6 }} />
                Approve
              </button>
            </footer>
          </article>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="admin-bulk-bar">
          <span className="admin-bulk-bar__count">
            {selected.size} selected
          </span>
          <div className="admin-bulk-bar__actions">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setSelected(new Set())}
              disabled={!!bulkProcessing}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              style={{ color: "var(--danger)" }}
              onClick={() => bulkAction("reject")}
              disabled={!!bulkProcessing}
            >
              <XCircle size={12} style={{ marginRight: 4 }} />
              {bulkProcessing === "reject" ? "Rejecting…" : "Reject all"}
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => bulkAction("approve")}
              disabled={!!bulkProcessing}
            >
              <CheckCircle size={12} style={{ marginRight: 4 }} />
              {bulkProcessing === "approve" ? "Approving…" : "Approve all"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
