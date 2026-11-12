"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

function mapError(code: string | null): { title: string; body: string } {
  if (!code) {
    return {
      title: "Sign-in error",
      body: "Something went wrong during sign-in. Try again from the site.",
    };
  }
  const map: Record<string, { title: string; body: string }> = {
    OAuthSignin: {
      title: "Could not start sign-in",
      body: "The sign-in flow couldn’t start. Try again, or pick a different provider.",
    },
    OAuthCallback: {
      title: "Callback failed",
      body: "The provider rejected the callback. Try the other provider, or check that cookies are enabled.",
    },
    OAuthCreateAccount: {
      title: "Could not create account",
      body: "We couldn’t create your account. Try again in a minute.",
    },
    OAuthAccountNotLinked: {
      title: "Account already linked",
      body: "This email is registered with a different sign-in method. Use that provider instead.",
    },
    AccessDenied: {
      title: "Sign-in cancelled",
      body: "You cancelled the sign-in. No changes were made.",
    },
    Configuration: {
      title: "Sign-in is unavailable",
      body: "There is a configuration issue on our side. Try again in a minute.",
    },
    Verification: {
      title: "Link expired",
      body: "This sign-in link has expired. Start over from the site.",
    },
  };
  return map[code] || {
    title: "Sign-in error",
    body: "Something went wrong. Try again, or pick the other provider.",
  };
}

export default function ErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("error");
  const { title, body } = mapError(code);

  return (
    <div className="auth-shell">
      <div className="card auth-card" style={{ padding: 32 }}>
        <p className="auth-eyebrow" style={{ color: "var(--danger)" }}>
          Authentication error
        </p>
        <h1 className="auth-title">{title}</h1>
        <p className="auth-sub">{body}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
          <Link href="/auth/signin" className="btn btn--primary">
            Try again
          </Link>
          <Link href="/" className="btn btn--secondary">
            Go home
          </Link>
        </div>
        {code && (
          <p
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              fontFamily: "var(--font-geist-mono), monospace",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Error code: {code}
          </p>
        )}
      </div>
    </div>
  );
}
