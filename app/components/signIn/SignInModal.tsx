'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { BorderBeam } from "@/components/magicui/border-beam";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-popover border border-border rounded-lg p-6 w-full max-w-md relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-center mb-6 text-foreground">Sign In</h2>

        <div className="space-y-4">
          {/* Google button — keep official brand styling (white bg, dark text) */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="flex items-center justify-center space-x-2 w-full bg-white text-gray-800 py-3 px-4 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Image
              src="/google-logo.png"
              alt="Google logo"
              width={20}
              height={20}
            />
            <span>Sign in with Google</span>
          </button>

          {/* Discord button — keep official brand styling (indigo bg, white text) */}
          <button
            onClick={() => signIn('discord', { callbackUrl: '/' })}
            className="flex items-center justify-center space-x-2 w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Image
              src="/discord-logo.png"
              alt="Discord logo"
              width={20}
              height={20}
            />
            <span>Sign in with Discord</span>
          </button>
        </div>

        <p className="text-muted-foreground text-sm text-center mt-6">
          Sign in to access exclusive features and content.
        </p>
        <BorderBeam duration={8} size={120} />
      </div>
    </div>
  );
}