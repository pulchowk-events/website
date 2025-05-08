'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import EditProductModal from './EditProductModal';

interface EditButtonProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
    image_url: string | null;
  };
}

export function EditButton({ product }: EditButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 rounded-lg transition-colors"
      >
        <Pencil className="w-4 h-4" />
        Edit Product
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