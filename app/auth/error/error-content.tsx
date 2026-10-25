// app/auth/error/error-content.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border p-8 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-red-600 dark:text-red-400">
          Authentication Error
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          {error === "OAuthCallback"
            ? "Something went wrong during authentication."
            : "An unexpected error occurred."}
        </p>
        <div className="flex justify-center">
          <a
            href="/auth/signin"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-full transition"
          >
            Try Again
          </a>
        </div>
      </div>
    </div>
  );
}