'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { showLoader, hideLoader } from '@/app/lib/loader';

function NavigationLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Combined key so BOTH path AND query changes trigger hide
  const routeKey = `${pathname}?${searchParams.toString()}`;

  // Start loader on click (unchanged logic — still needed)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) return;

      // Skip if navigating to the exact URL we're already on
      const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      if (href === currentUrl || href === pathname) return;

      showLoader();
    };

    const handlePopState = () => showLoader();

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, searchParams]);

  // Stop loader on ANY route change — path or query
  useEffect(() => {
    const t = setTimeout(() => hideLoader(), 50);
    return () => clearTimeout(t);
  }, [routeKey]);

  return null;
}

// Suspense boundary required because useSearchParams opts the tree into
// dynamic rendering in Next 15+. Root layout mounts this.
export default function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderInner />
    </Suspense>
  );
}