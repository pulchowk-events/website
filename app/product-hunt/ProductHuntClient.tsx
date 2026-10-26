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
  const [showSignInModal, setShowSignInModal] = useState(false);

  // Sync modal visibility with the URL (so bookmarks/back button work)
  useEffect(() => {
    setShowModal(searchParams.get('showAddProduct') === 'true');
  }, [searchParams]);

  const openAddProductModal = () => {
    if (!isLoggedIn) {
      setShowSignInModal(true);
      return;
    }
    // Show modal immediately via local state
    setShowModal(true);
    // Reflect in URL without triggering a server nav
    const url = new URL(window.location.href);
    url.searchParams.set('showAddProduct', 'true'); // ✅ correct key
    window.history.replaceState({}, '', url.toString());
  };

  const closeAddProductModal = () => {
    setShowModal(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('showAddProduct');
    window.history.replaceState({}, '', url.toString());
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Product List</h1>
          <div className="flex items-center gap-4">
            <ClientVoteCooldownNotice />
            <button
              onClick={openAddProductModal}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Product
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="text-center py-12 bg-muted/30 border border-border rounded-lg">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}