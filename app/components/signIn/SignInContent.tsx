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
    OAuthAccountNotLinked: "This email is already registered with a different sign-in method. Use that provider instead.",
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

  const busy = !!pending;

  return (
    <div className={"signin signin--" + layout}>
      <div className="signin__head">
        <h2 className="signin__title">Sign in to Pulchowk Events</h2>
        <p className="signin__sub">One click. No password.</p>
      </div>

      {errorMsg && (
        <div className="signin__error" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="signin__stack">
        <button
          type="button"
          onClick={() => start("google")}
          disabled={busy}
          className="signin-provider"
        >
          {pending === "google" ? (
            <Loader2 size={16} className="signin__spinner" />
          ) : (
            <Image src="/google-logo.png" alt="" width={16} height={16} aria-hidden="true" />
          )}
          <span>{pending === "google" ? "Opening Google…" : "Continue with Google"}</span>
        </button>

        <button
          type="button"
          onClick={() => start("discord")}
          disabled={busy}
          className="signin-provider"
        >
          {pending === "discord" ? (
            <Loader2 size={16} className="signin__spinner" />
          ) : (
            <Image src="/discord-logo.png" alt="" width={16} height={16} aria-hidden="true" />
          )}
          <span>{pending === "discord" ? "Opening Discord…" : "Continue with Discord"}</span>
        </button>
      </div>

      <p className="signin__legal">
        By continuing, you agree to our <a href="/terms">Terms</a> and{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </div>
  );
}
