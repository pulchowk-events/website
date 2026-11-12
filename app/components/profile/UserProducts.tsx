'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  image_url: string;
  url: string;
  approved: boolean;
  votes_count: number;
  created_at: string;
}

export default function UserProducts({ userId }: { userId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/users/' + userId + '/products');
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching user products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [userId]);

  if (loading) {
    return (
      <div className="user-products">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 240 }} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No projects yet.</p>
        <p className="empty-state__desc">This user hasn&apos;t shipped anything to Product Hunt.</p>
      </div>
    );
  }

  return (
    <div className="user-products">
      {products.map((product) => (
        <Link
          key={product.id}
          href={'/product-hunt/' + product.url}
          className="user-product"
        >
          <div className="user-product__media">
            <Image
              src={product.image_url || '/product-placeholder.png'}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="user-product__img"
            />
          </div>
          <div className="user-product__body">
            <div className="user-product__head">
              <h3 className="user-product__title">{product.name}</h3>
              <ExternalLink size={14} className="user-product__arrow" />
            </div>
            <p className="user-product__desc">{product.description}</p>
            <div className="user-product__meta">
              <span
                className={'tag ' + (product.approved ? 'tag--event' : 'tag--job')}
              >
                {product.approved ? 'Approved' : 'Pending'}
              </span>
              <span className="user-product__votes">
                {product.votes_count ?? 0} {product.votes_count === 1 ? 'vote' : 'votes'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
