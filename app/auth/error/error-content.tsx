'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <p className="auth-eyebrow" style={{ color: 'var(--danger)' }}>
          Authentication error
        </p>
        <h1 className="auth-title">Something went wrong.</h1>
        <p className="auth-sub">
          {error === 'OAuthCallback'
            ? 'The authentication provider rejected the callback. Try a different provider or try again.'
            : 'An unexpected error occurred. Try signing in again.'}
        </p>
        <Link href="/auth/signin" className="btn btn--primary" style={{ width: '100%', height: 44 }}>
          <span className="btn__label">Try again</span>
          <span className="btn__label btn__label--dup" aria-hidden="true">Try again</span>
        </Link>
      </div>
    </div>
  );
}
