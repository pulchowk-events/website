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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
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
        className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-red-100 dark:bg-red-600/20 hover:bg-red-200 dark:hover:bg-red-600/30 text-red-700 dark:text-red-500 rounded-lg transition-colors"
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4" />
        {!isMobile && <span>Remove Product</span>}
      </button>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-popover p-4 sm:p-6 rounded-xl border border-border max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Remove Product</h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
              Are you sure you want to remove &quot;{productName}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-secondary hover:bg-accent text-secondary-foreground rounded-lg"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg"
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