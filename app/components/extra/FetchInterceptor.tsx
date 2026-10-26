'use client';

import { useEffect } from 'react';
import { showLoader, hideLoader, isIgnoredUrl } from '@/app/lib/loader';

export default function FetchInterceptor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;

    window.fetch = async function interceptFetch(
      input: RequestInfo | URL,
      init?: RequestInit
    ) {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      // Skip loader for background polls, session checks, etc.
      if (isIgnoredUrl(url)) {
        return originalFetch(input, init);
      }

      showLoader();
      try {
        return await originalFetch(input, init);
      } finally {
        hideLoader();
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}