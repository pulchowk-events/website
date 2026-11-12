import ErrorContent from './error-content';
import { Suspense } from 'react';

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-shell">
          <div className="card auth-card">
            <div className="skeleton" style={{ height: 24, width: '60%', margin: '0 auto 24px' }} />
            <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 16, width: '80%', margin: '0 auto' }} />
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
