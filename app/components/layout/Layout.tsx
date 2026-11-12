'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { VoteProvider } from '../../lib/VoteContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const HIDE_SIDEBAR_ON = ['/admin'];

export default function Layout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const showSidebar =
    pathname !== null && !HIDE_SIDEBAR_ON.some((p) => pathname === p || pathname?.startsWith(p + '/'));

  return (
    <SessionProvider>
      {mounted && <div id="portal-root" />}
      <div className="root min-h-screen flex flex-col">
        <Navbar />
        <div className={showSidebar ? 'app-shell app-shell--with-sidebar' : 'app-shell'}>
          {showSidebar && <Sidebar />}
          <main className="app-main flex-grow">
            <VoteProvider>{children}</VoteProvider>
          </main>
        </div>
        <Footer />
      </div>
    </SessionProvider>
  );
}
