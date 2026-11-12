'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { VoteProvider } from '../../lib/VoteContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const FULLSCREEN_ROUTES = ['/admin'];

export default function Layout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFullscreen =
    pathname !== null &&
    FULLSCREEN_ROUTES.some((p) => pathname === p || pathname?.startsWith(p + '/'));

  if (isFullscreen) {
    return (
      <SessionProvider>
        {mounted && <div id="portal-root" />}
        <VoteProvider>{children}</VoteProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      {mounted && <div id="portal-root" />}
      <div className="root min-h-screen flex flex-col">
        <Navbar />
        <div className="app-shell app-shell--with-sidebar">
          <Sidebar />
          <main className="app-main flex-grow">
            <VoteProvider>{children}</VoteProvider>
          </main>
        </div>
        <Footer />
      </div>
    </SessionProvider>
  );
}
