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

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-black/95 border border-zinc-800 rounded-lg  p-6 w-full max-w-md relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-center mb-6">Sign In</h2>
        
        <div className="space-y-4">
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
        
        <p className="text-zinc-400 text-sm text-center mt-6">
          Sign in to access exclusive features and content.
        </p>
              <BorderBeam duration={8} size={120} />
      </div>
          
    </div>
  );
}