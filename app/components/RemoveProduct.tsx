'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface RemoveButtonProps {
  productId: number;        // use a number here to match your schema
  productName: string;
}

export function RemoveButton({ productId, productName }: RemoveButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    setIsDeleting(true);

    try {
      // 1️⃣ Delete votes for this product
      const { error: voteError } = await supabase
        .from('votes')
        .delete()
        .eq('product_id', productId);

      if (voteError) throw voteError;

      // 2️⃣ Now delete the product
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (productError) throw productError;

      toast.success('Product and its votes removed successfully');
      router.push('/admin');
    } catch (error) {
      console.error('Error removing product or votes:', error);
      toast.error('Failed to remove product');
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-colors"
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4" />
        Remove Product
      </button>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Remove Product</h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to remove &quot;{productName}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                disabled={isDeleting}
              >
                {isDeleting ? 'Removing...' : 'Yes, remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
