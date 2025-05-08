'use client'

import { ReactNode, useEffect, useState } from 'react'
import { SessionProvider } from 'next-auth/react';
import { VoteProvider } from '../../lib/VoteContext';
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }: { children: ReactNode }) {

    // Ensure portal mount after hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SessionProvider>
      {mounted && <div id="portal-root" />}
      <div className="root min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <VoteProvider>
            {children}
          </VoteProvider>
        </main>
        <Footer />
     
   
        </div>
    </SessionProvider>
  )
}
