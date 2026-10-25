'use client'

import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import { ChevronLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-8xl sm:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">
            404
          </h1>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="text-muted-foreground">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-accent text-foreground rounded-lg transition-colors border border-border"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}