'use client';

import { Suspense } from 'react';
import { SignInPage } from './SignInPage';

export default function SignInPageWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <SignInPage />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <div className="skeleton" style={{ height: 24, width: '60%', margin: '0 auto 24px' }} />
        <div className="skeleton" style={{ height: 44, borderRadius: 99, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 44, borderRadius: 99 }} />
      </div>
    </div>
  );
}
