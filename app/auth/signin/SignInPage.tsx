"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border p-8 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-foreground">
          Sign In to Pulchowk Events
        </h1>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded text-sm">
            Authentication failed. Please try again.
          </div>
        )}

        <div className="flex flex-col space-y-4">
          {/* Discord Sign In Button — brand color, do not theme */}
          <form
            action={async () => {
              await signIn("discord", { callbackUrl: "/" });
            }}
            className="flex justify-center"
          >
            <button
              type="submit"
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-2 px-4 rounded-full transition flex items-center justify-center gap-2"
            >
              <Image
                src="/discord-logo.png"
                alt="Discord logo"
                width={20}
                height={20}
              />
              Sign In with Discord
            </button>
          </form>

          {/* Google Sign In Button — brand color, do not theme */}
          <form
            action={async () => {
              await signIn("google", { callbackUrl: "/" });
            }}
            className="flex justify-center"
          >
            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-full transition flex items-center justify-center gap-2"
            >
              <Image
                src="/google-logo.png"
                alt="Google logo"
                width={20}
                height={20}
              />
              Sign In with Google
            </button>
          </form>
        </div>

        <p className="text-muted-foreground text-sm text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}