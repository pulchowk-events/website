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
    redirect_url: string | null;
  };
}

export default function EditButton({ product }: EditButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="btn btn--secondary"
      >
        <span className="btn__label">
          <Pencil size={14} style={{ marginRight: 8 }} />
          Edit project
        </span>
        <span className="btn__label btn__label--dup" aria-hidden="true">
          <Pencil size={14} style={{ marginRight: 8 }} />
          Edit project
        </span>
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
