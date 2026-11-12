"use client";

import { useSearchParams } from "next/navigation";
import { SignInContent } from "@/app/components/signIn/SignInContent";

export function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="signin-page">
      <div className="signin-panel signin-panel--static">
        <SignInContent callbackUrl={callbackUrl} error={error} layout="page" />
      </div>
    </div>
  );
}
