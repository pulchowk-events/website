'use client';

import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import EditProductModal from './EditProductModal';

interface EditButtonProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
    image_url: string | null;
     redirect_url: string | null;
  };
}

export default function EditButton({ product }: EditButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 rounded-lg transition-colors"
      >
        <Pencil className="w-4 h-4" />
        {!isMobile && <span>Edit Product</span>}
      </button>

      {isModalOpen && (
        <EditProductModal 
          product={product}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}