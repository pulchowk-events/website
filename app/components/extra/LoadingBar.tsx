'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import { usePathname } from 'next/navigation';

NProgress.configure({
  showSpinner: false,
  easing: 'ease',
  speed: 500,
  minimum: 0.1,
  trickleSpeed: 200,
});

export default function LoadingBar() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();

    const timeoutId = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      NProgress.done();
    };
  }, [pathname]);

  return null;
}