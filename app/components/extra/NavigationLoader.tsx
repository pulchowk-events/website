'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { showLoader, hideLoader } from '@/app/lib/loader';

export default function NavigationLoader() {
  const pathname = usePathname();

  // Start loader on link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

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
      ) {
        return;
      }

      // Same page? don't show loader
      if (href === pathname) return;

      showLoader();
    };

    const handlePopState = () => {
      showLoader();
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);

  // Stop loader when the new page has rendered
  useEffect(() => {
    // Small delay so the loader doesn't blink-off and on again if
    // the route re-renders quickly (e.g., search params change)
    const t = setTimeout(() => hideLoader(), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}