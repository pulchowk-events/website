'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react';
import { VoteProvider } from '../../lib/VoteContext';
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
            <SessionProvider>
              <VoteProvider>
                {children}
              </VoteProvider>
            </SessionProvider>
      </main>
      <Footer />
    </div>
  )
}