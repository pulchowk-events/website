'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const cache = new Map<string, Promise<boolean>>();

function checkAdmin(email: string): Promise<boolean> {
  const cached = cache.get(email);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const url = '/api/admin/checkAdmin?email=' + encodeURIComponent(email);
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.isAdmin === true;
    } catch {
      return false;
    }
  })();

  cache.set(email, promise);
  return promise;
}

/**
 * Returns true/false once the current user's admin status has been
 * resolved, or null while unresolved or signed out. Results are cached
 * per-email in-module so Navbar and Sidebar don't double-fetch.
 */
export function useIsAdmin(): boolean | null {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    const email = session?.user?.email;
    if (!email) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    checkAdmin(email).then((value) => {
      if (!cancelled) setIsAdmin(value);
    });
    return () => {
      cancelled = true;
    };
  }, [session, status]);

  return isAdmin;
}
