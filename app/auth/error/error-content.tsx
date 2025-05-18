// app/auth/error/error-content.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
export default function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
    <div className="min-h-screen flex items-center justify-center bg-charcoal">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-red-400">
          Authentication Error
        </h1>
        <p className="text-gray-400 mb-6 text-center">
          {error === "OAuthCallback"
            ? "Something went wrong during authentication."
            : "An unexpected error occurred."}
        </p>
        <div className="flex justify-center">
          <a
            href="/auth/signin"
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-full transition"
          >
            Try Again
          </a>
        </div>
      </div>
    </div>
    </Suspense>
  );
}
