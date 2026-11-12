'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink, User, Calendar } from 'lucide-react';
import { formatDatePadded } from '@/app/lib/formatDate';
import { toast } from 'sonner';
import Image from 'next/image';

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

  useEffect(() => {
    fetchPendingProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPendingProducts() {
    try {
      setLoading(true);
      const response = await fetch('/api/products/pending');
      if (!response.ok) throw new Error('Failed to fetch products');
      const { products, usernames } = await response.json();
      setProducts(products);
      setUsernames(usernames);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to load pending products');
    } finally {
      setLoading(false);
    }
  }

  async function handleProductApproval(id: number, approved: boolean) {
    try {
      setProcessing((prev) => ({ ...prev, [id]: true }));
      const response = await fetch('/api/products/pending/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, approved }),
      });
      if (!response.ok) {
        throw new Error(approved ? 'Failed to approve product' : 'Failed to reject product');
      }
      toast.success(approved ? 'Product approved' : 'Product rejected');
      setProducts(products.filter((product) => product.id !== id));
    } catch (err) {
      console.error('Error:', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
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

  return (
    <div className="admin-pending-grid">
      {products.map((product) => (
        <article key={product.id} className="admin-pending__card">
          <div className="admin-pending__body" style={{ padding: 16 }}>
            <div className="admin-product-row">
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
                    aria-label={'Open ' + product.name}
                    style={{ margin: 0, flexShrink: 0 }}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="admin-pending__meta">
                  <span className="admin-pending__meta-item">
                    <User size={12} />
                    <span className="admin-pending__truncate">
                      {usernames[product.posted_by] || 'Unknown user'}
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
              disabled={!!processing[product.id]}
              className="btn btn--secondary"
              style={{ color: 'var(--danger)' }}
            >
              <span className="btn__label">
                <XCircle size={14} style={{ marginRight: 8 }} />
                Reject
              </span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                <XCircle size={14} style={{ marginRight: 8 }} />
                Reject
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleProductApproval(product.id, true)}
              disabled={!!processing[product.id]}
              className="btn btn--primary"
            >
              <span className="btn__label">
                <CheckCircle size={14} style={{ marginRight: 8 }} />
                Approve
              </span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                <CheckCircle size={14} style={{ marginRight: 8 }} />
                Approve
              </span>
            </button>
          </footer>
        </article>
      ))}
    </div>
  );
}
