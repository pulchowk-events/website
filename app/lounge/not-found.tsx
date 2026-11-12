import Layout from '@/app/components/layout/Layout';
import Link from 'next/link';
import { MessageCircle, Home } from 'lucide-react';

export default function LoungeNotFound() {
  return (
    <Layout>
      <div className="w">
        <div className="not-found">
          <p className="not-found__code">Lounge</p>
          <h1 className="not-found__title">Post not available.</h1>
          <p className="not-found__desc">
            This post may have been deleted by its author, or the link is incorrect.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <Link href="/lounge" className="btn btn--primary">
              <span className="btn__label">
                <MessageCircle size={14} style={{ marginRight: 8 }} />
                Browse the lounge
              </span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                <MessageCircle size={14} style={{ marginRight: 8 }} />
                Browse the lounge
              </span>
            </Link>
            <Link href="/" className="btn btn--secondary">
              <span className="btn__label">
                <Home size={14} style={{ marginRight: 8 }} />
                Go home
              </span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                <Home size={14} style={{ marginRight: 8 }} />
                Go home
              </span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
