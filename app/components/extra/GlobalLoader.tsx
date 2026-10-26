'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { subscribeLoader } from '@/app/lib/loader';

// useSyncExternalStore is React 18's built-in way to subscribe to a
// plain JS store without causing tearing / double renders.
function useLoaderState() {
  return useSyncExternalStore(
    subscribeLoader,
    // getSnapshot must return the current state synchronously
    () => (typeof window !== 'undefined' ? isLoaderVisible() : false),
    // getServerSnapshot — loader is always hidden on the server
    () => false
  );
}

// We need a getter for the current state. Add it to loader.ts.
// (See note below.)
import { getLoaderVisible } from '@/app/lib/loader';
function isLoaderVisible() {
  return getLoaderVisible();
}

export default function GlobalLoader() {
  const loading = useLoaderState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on the server (SSR mismatch); only client
  if (!mounted || !loading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150"
    >
      <div className="relative flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-[4px] border-green-500/20 border-t-green-500 animate-spin" />
        <p className="text-white/80 text-sm font-medium tracking-wide">
          Loading…
        </p>
      </div>
    </div>
  );
}