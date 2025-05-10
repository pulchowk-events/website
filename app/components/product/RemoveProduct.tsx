'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface RemoveButtonProps {
  productId: number;
  productName: string;
  isOwner?: boolean;
}

export function RemoveButton({ productId, productName, isOwner = false }: RemoveButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRemove = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch('/api/products/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, isOwner }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove product');
      }

      toast.success('Product and associated data removed successfully');
      router.refresh();
      router.push('/admin');
    } catch (error) {
      console.error('Removal error:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to remove product'
      );
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-colors"
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4" />
        {!isMobile && <span>Remove Product</span>}
      </button>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-xl border border-zinc-800 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Remove Product</h3>
            <p className="text-zinc-400 text-sm sm:text-base mb-4 sm:mb-6">
              Are you sure you want to remove &quot;{productName}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg"
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