'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ProductCard from '@/app/components/product/ProductCard';
import ClientVoteCooldownNotice from '@/app/components/vote/ClientVoteCooldown';
import AddProductModal from '@/app/components/product/AddProductModal';
import SignInModal from '@/app/components/signIn/SignInModal';

interface Props {
  products: any[];
  userId?: string;
}

export default function ProductHuntClient({ products, userId }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const isLoggedIn = !!userId;

  useEffect(() => {
    setShowModal(searchParams.get('showAddProduct') === 'true');
  }, [searchParams]);

  const openAddProductModal = () => {
    if (!isLoggedIn) {
      setShowSignInModal(true);
      return;
    }
    setShowModal(true);
    const url = new URL(window.location.href);
    url.searchParams.set('showAddProduct', 'true');
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
        )}

      <div className="products-toolbar">
        <ClientVoteCooldownNotice />
        <button
          type="button"
          onClick={openAddProductModal}
          className="btn btn--primary"
        >
          <span className="btn__label">Add product</span>
          <span className="btn__label btn__label--dup" aria-hidden="true">Add product</span>
        </button>
      </div>

      {products.length > 0 ? (
        <div className="products-list">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state__title">No projects yet.</p>
          <p className="empty-state__desc">Be the first to ship something here.</p>
        </div>
      )}
    </>
  );
}
