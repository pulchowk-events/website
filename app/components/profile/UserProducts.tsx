'use client';

import { useEffect, useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  image_url: string;
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
        const response = await fetch(`/api/users/${userId}/products`);
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
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        No products yet
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product-hunt/${product.id}`}
          className="group bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden hover:border-zinc-600 transition-colors"
        >
          <div className="aspect-video relative">
            <Image
              src={product.image_url || '/product-placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-medium text-white group-hover:text-green-500 transition-colors truncate">
                {product.name}
              </h3>
              <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-green-500" />
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2">
              {product.description}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className={`px-2 py-1 rounded-full ${
                product.approved 
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-amber-500/10 text-amber-400'
              }`}>
                {product.approved ? 'Approved' : 'Pending'}
              </span>
              <span className="text-zinc-500">
                {product.votes_count} votes
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}