'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from '@/app/components/product/ProductCard';
import ClientVoteCooldownNotice from '@/app/components/vote/ClientVoteCooldown';
import AddProductModal from '@/app/components/product/AddProductModal'; 
import { createPortal } from 'react-dom'; 
import SignInModal from '@/app/components/signIn/SignInModal';

interface Props {
  products: any[];
  userId?: string;
}

export default function ProductHuntClient({ products, userId }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const isLoggedIn = !!userId;
  const [showSignInModal, setShowSignInModal] = useState(!userId);

  useEffect(() => {

    setShowSignInModal(!userId);

    // Check if the URL has the query string 'showAddProduct=true'
    setShowModal(searchParams.get('showAddProduct') === 'true');
  }, [searchParams]);

  const openAddProductModal = () => {
    if (!isLoggedIn) {
      setShowSignInModal(true);
      return;
    }
    router.push('?showAddProduct=true');
  };

  const closeAddProductModal = () => {
    router.push('?showAddProduct=false'); // Remove the query parameter
  };

  return (
    <>
      {showSignInModal && (
        <SignInModal 
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
        />
      )}

      {showModal && typeof document !== 'undefined' &&
        createPortal(
          <AddProductModal onClose={closeAddProductModal} />,
          document.getElementById('portal-root')! || document.body
        )
      }

      <div className="relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
          <div className="flex items-center gap-4">
            <ClientVoteCooldownNotice />
            <button
              onClick={openAddProductModal}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Product
            </button>
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