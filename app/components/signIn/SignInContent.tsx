"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

type Provider = "discord" | "google";

interface Props {
  callbackUrl: string;
  error?: string | null;
  layout?: "modal" | "page";
}

function mapError(code: string | null | undefined): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    OAuthSignin: "Could not start the sign-in flow. Try again, or pick the other provider.",
    OAuthCallback: "The provider rejected the callback. Try the other provider, or check that cookies are enabled.",
    OAuthCreateAccount: "Could not create your account. Try again.",
    EmailCreateAccount: "Could not create your account. Try again.",
    Callback: "The sign-in callback failed. Try again.",
    OAuthAccountNotLinked: "This email is already registered with a different sign-in method. Use that provider instead.",
    EmailSignin: "Email sign-in is not available. Use Discord or Google.",
    CredentialsSignin: "Sign-in failed. Try again.",
    SessionRequired: "Sign in to continue.",
    AccessDenied: "Sign-in was cancelled.",
    Configuration: "Sign-in is temporarily unavailable. Try again in a minute.",
    Verification: "The sign-in link has expired.",
    Default: "Something went wrong during sign-in. Try again.",
  };
  return map[code] || map.Default;
}

export function SignInContent({ callbackUrl, error, layout = "modal" }: Props) {
  const [pending, setPending] = useState<Provider | null>(null);
  const errorMsg = mapError(error);

  const start = async (provider: Provider) => {
    if (pending) return;
    setPending(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setPending(null);
    }
  };

  return (
    <div className={"signin-content signin-content--" + layout}>
      <p className="signin-content__intro">
        Save events, post in the Lounge, vote on projects, and apply to jobs.
      </p>

      {errorMsg && (
        <div className="signin-content__error" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="signin-content__stack">
        <button
          type="button"
          onClick={() => start("discord")}
          disabled={!!pending}
          className="signin__btn signin__btn--discord"
        >
          {pending === "discord" ? (
            <>
              <Loader2 size={16} className="signin__spinner" />
              <span>Redirecting to Discord…</span>
            </>
          ) : (
            <>
              <Image src="/discord-logo.png" alt="" width={18} height={18} aria-hidden="true" />
              <span>Continue with Discord</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => start("google")}
          disabled={!!pending}
          className="signin__btn signin__btn--google"
        >
          {pending === "google" ? (
            <>
              <Loader2 size={16} className="signin__spinner" />
              <span>Redirecting to Google…</span>
            </>
          ) : (
            <>
              <Image src="/google-logo.png" alt="" width={18} height={18} aria-hidden="true" />
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div>

      <p className="signin-content__legal">
        By signing in, you agree to our <a href="/terms">Terms</a> and{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </div>
  );
}
