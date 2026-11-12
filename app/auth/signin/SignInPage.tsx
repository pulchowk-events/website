"use client";

import { useSearchParams } from "next/navigation";
import { SignInContent } from "@/app/components/signIn/SignInContent";

export function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="auth-shell">
      <div className="card auth-card" style={{ padding: 32 }}>
        <h1 className="auth-title">Sign in to Pulchowk Events</h1>
        <SignInContent callbackUrl={callbackUrl} error={error} layout="page" />
      </div>
    </div>
  );
}
