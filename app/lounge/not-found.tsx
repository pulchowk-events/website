import Layout from '@/app/components/layout/Layout';
import Link from 'next/link';
import { MessageCircle, Home } from 'lucide-react';

export default function LoungeNotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Post not available
            </h1>
            <p className="text-muted-foreground">
              This post may have been deleted by its author or the link may be incorrect.
              The lounge is still here though.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/lounge"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Browse the lounge
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground px-5 py-2.5 rounded-lg font-medium transition-colors border border-border"
            >
              <Home className="w-4 h-4" />
              Go home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}