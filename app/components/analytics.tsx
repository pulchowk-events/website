'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export default function Analytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      // First mount: gtag(\'config\') below sends the initial page_view.
      initialLoad.current = false;
      return;
    }
    const send = () => {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_path: pathname + window.location.search,
          page_location: window.location.href,
        });
      } else {
        setTimeout(send, 100);
      }
    };
    send();
  }, [pathname]);

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
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
