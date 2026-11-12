'use client';

import { useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="signin-title">
      <div
        ref={modalRef}
        className="modal"
        style={{ maxWidth: 400 }}
      >
        <header className="modal__head">
          <h2 id="signin-title" className="modal__title">Sign in</h2>
          <button
            type="button"
            onClick={onClose}
            className="modal__close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="modal__body">
          <p className="signin__intro">
            Sign in to submit projects, vote, comment, and access the community lounge.
          </p>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="signin__btn signin__btn--google"
          >
            <Image
              src="/google-logo.png"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => signIn('discord', { callbackUrl: '/' })}
            className="signin__btn signin__btn--discord"
          >
            <Image
              src="/discord-logo.png"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            <span>Continue with Discord</span>
          </button>
        </div>
      </div>
    </div>
  );
}
