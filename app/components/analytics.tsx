'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export default function Analytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();

  // Fire a page_view on every route change. GA4's built-in config only
  // fires once on initial load — for SPA navigations (which all of this
  // site uses) we have to fire it manually.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    const url = pathname + window.location.search;
    window.gtag('config', measurementId, { page_path: url });
  }, [pathname, measurementId]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}