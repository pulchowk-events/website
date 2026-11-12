'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

export function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h1 className="auth-title">Sign in to Pulchowk Events</h1>
        <p className="auth-sub">Welcome back. Pick a provider to continue.</p>

        {error && (
          <div className="auth-error" role="alert">
            Authentication failed. Please try again.
          </div>
        )}

        <div className="auth-stack">
          <form
            action={async () => {
              await signIn('discord', { callbackUrl: '/' });
            }}
          >
            <button type="submit" className="signin__btn signin__btn--discord">
              <Image src="/discord-logo.png" alt="" width={18} height={18} aria-hidden="true" />
              <span>Continue with Discord</span>
            </button>
          </form>

          <form
            action={async () => {
              await signIn('google', { callbackUrl: '/' });
            }}
          >
            <button type="submit" className="signin__btn signin__btn--google">
              <Image src="/google-logo.png" alt="" width={18} height={18} aria-hidden="true" />
              <span>Continue with Google</span>
            </button>
          </form>
        </div>

        <p className="auth-legal">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
