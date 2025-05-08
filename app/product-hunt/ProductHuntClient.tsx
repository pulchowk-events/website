'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/app/components/ProductCard';
import ClientVoteCooldownNotice from '@/app/components/ClientVoteCooldown';
import AddProductModal from '@/app/components/AddProductModal'; // your modal
import { createPortal } from 'react-dom'; // Import React Portal

interface Props {
  products: any[];
  userId?: string;
}

export default function ProductHuntClient({ products, userId }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if the URL has the query string 'showAddProduct=true'
    setShowModal(searchParams.get('showAddProduct') === 'true');
  }, [searchParams]);

  const openAddProductModal = () => {
    router.push('?showAddProduct=true');  // Update URL query without reload
  };

  const closeAddProductModal = () => {
    router.push('?showAddProduct=false'); // Remove the query parameter
  };

  return (
    <>
{showModal && typeof document !== 'undefined' &&
  createPortal(
    <AddProductModal onClose={closeAddProductModal} />,
    document.getElementById('portal-root')! || document.body // Fallback to body if portal-root is not found
  )
}


    <div className="max-w-4xl mx-auto py-10 px-4 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex items-center gap-4">
          <ClientVoteCooldownNotice />
          {userId && (
            <button
              onClick={openAddProductModal}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Product
            </button>
          )}
        </div>
      </div>



      <div className="grid gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="text-center text-gray-400">No products found.</p>
        )}
      </div>
    </div>
    </>
  );
}
