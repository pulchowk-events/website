'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
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
  }, []);

  async function fetchPendingProducts() {
    try {
      setLoading(true);
      const response = await fetch('/api/products/pending');

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

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
      setProcessing(prev => ({ ...prev, [id]: true }));

      const response = await fetch('/api/products/pending/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id, approved }),
      });

      if (!response.ok) {
        throw new Error(approved ? 'Failed to approve product' : 'Failed to reject product');
      }

      toast.success(
        approved
          ? 'Product approved successfully'
          : 'Product rejected and removed'
      );

      setProducts(products.filter(product => product.id !== id));
    } catch (err) {
      console.error('Error:', err);
      toast.error(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      );
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground">No pending products</h3>
        <p className="text-muted-foreground mt-2">All products have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {products.map((product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-card/50 rounded-lg p-5 shadow-md flex flex-col justify-between border border-border"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 flex-shrink-0">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={96}
                    height={96}
                    unoptimized
                    className="rounded-lg object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No Image</span>
                  </div>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-foreground line-clamp-2 pr-2">
                    {product.name}
                  </h3>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center flex-shrink-0"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>

                <div className="flex items-center space-x-4 mb-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span className="truncate">
                      {usernames[product.posted_by] || 'Unknown user'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{format(new Date(product.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-foreground line-clamp-3">{product.description}</p>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => handleProductApproval(product.id, true)}
              disabled={!!processing[product.id]}
              className="p-2 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30 disabled:opacity-50 transition-colors shadow-sm"
              aria-label="Approve product"
            >
              <CheckCircle className="h-6 w-6" />
            </button>
            <button
              onClick={() => handleProductApproval(product.id, false)}
              disabled={!!processing[product.id]}
              className="p-2 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 disabled:opacity-50 transition-colors shadow-sm"
              aria-label="Reject product"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}