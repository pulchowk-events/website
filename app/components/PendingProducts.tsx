'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, ExternalLink, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  votes: number;
  created_at: string;
  approved: boolean;
  posted_by: string;
}

export default function PendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  async function fetchPendingProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('approved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending products:', error);
        toast.error('Failed to load pending products');
        return;
      }

      setProducts(data || []);
      
      // Fetch usernames for all products
      const userIds = [...new Set(data?.map(product => product.posted_by) || [])];
      if (userIds.length > 0) {
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id, name')
          .in('id', userIds);
          
        if (!userError && users) {
          const usernameMap: Record<string, string> = {};
          users.forEach(user => {
            usernameMap[user.id] = user.name;
          });
          setUsernames(usernameMap);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleProductApproval(id: number, approved: boolean) {
    try {
      setProcessing(prev => ({ ...prev, [id]: true }));
      
      if (approved) {
        // Approve the product
        const { error } = await supabase
          .from('products')
          .update({ approved })
          .eq('id', id);

        if (error) {
          console.error('Error updating product:', error);
          toast.error('Failed to approve product');
          return;
        }
        toast.success('Product approved successfully');
      } else {
        // Delete the product when rejected
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting product:', error);
          toast.error('Failed to reject product');
          return;
        }
        toast.success('Product rejected and removed successfully');
      }
      
      // Remove from list
      setProducts(products.filter(product => product.id !== id));
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong');
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
        <h3 className="text-lg font-medium text-zinc-300">No pending products</h3>
        <p className="text-zinc-500 mt-2">All products have been reviewed</p>
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
          className="bg-zinc-700/30 rounded-lg p-5 shadow-md min-h-64 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-white line-clamp-2">{product.name}</h3>
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center ml-2 flex-shrink-0"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
            
            <div className="flex items-center space-x-4 mb-3 text-sm text-zinc-400">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span className="truncate">{usernames[product.posted_by] || 'Unknown user'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(new Date(product.created_at), 'MMM dd, yyyy')}</span>
              </div>
            </div>
            
            <p className="text-zinc-300 mb-4 line-clamp-3">{product.description}</p>
          </div>
          
          <div className="flex justify-end gap-3 mt-auto">
            <button
              onClick={() => handleProductApproval(product.id, true)}
              disabled={!!processing[product.id]}
              className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 transition-colors shadow-sm"
              aria-label="Approve product"
            >
              <CheckCircle className="h-6 w-6" />
            </button>
            <button
              onClick={() => handleProductApproval(product.id, false)}
              disabled={!!processing[product.id]}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 transition-colors shadow-sm"
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