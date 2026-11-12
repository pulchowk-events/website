import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Layout from '@/app/components/layout/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="w not-found">
        <p className="not-found__code">404</p>
        <h1 className="not-found__title">Page not found.</h1>
        <p className="not-found__desc">
          The page you are looking for might have been removed, renamed, or is temporarily
          unavailable.
        </p>
        <Link href="/" className="btn btn--secondary">
          <span className="btn__label">
            <ChevronLeft size={14} style={{ marginRight: 8 }} />
            Back to home
          </span>
          <span className="btn__label btn__label--dup" aria-hidden="true">
            <ChevronLeft size={14} style={{ marginRight: 8 }} />
            Back to home
          </span>
        </Link>
      </div>
    </Layout>
  );
}
