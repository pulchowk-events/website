'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import { usePathname } from 'next/navigation';

// Configure ONCE at module load, not inside the component.
NProgress.configure({
  showSpinner: false,
  easing: 'ease',
  speed: 400,
  minimum: 0.15,
  trickleSpeed: 120,
});

export default function LoadingBar() {
  const pathname = usePathname();

  // 1. START the bar when a navigation is about to happen.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Respect modifier keys (open-in-new-tab should not show progress)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external, hash-only, mailto:, tel:, and _blank targets
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

      // Skip navigation to the page we're already on
      if (href === pathname) return;

      NProgress.start();
    };

    // Back / forward browser buttons
    const handlePopState = () => {
      NProgress.start();
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);

  // 2. FINISH the bar when the new page actually lands.
  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return null;
}