'use client'

import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import { ChevronLeft } from 'lucide-react';


export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center  justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Large 404 Number */}
          <h1 className="text-8xl sm:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">
            404
          </h1>
          
          {/* Error Message */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              Page Not Found
            </h2>
            <p className="text-zinc-400">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>

          {/* Back to Home Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}