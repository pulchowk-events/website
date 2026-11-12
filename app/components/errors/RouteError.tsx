"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCw } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function RouteError({ error, reset, title = "Something went wrong" }: Props) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  return (
    <div className="route-error">
      <span className="route-error__icon">
        <AlertCircle size={20} />
      </span>
      <h1 className="route-error__title">{title}</h1>
      <p className="route-error__desc">
        The page couldn&apos;t load. This can be a temporary issue — try again.
      </p>
      {error.digest && (
        <p className="route-error__code">Error ID: {error.digest}</p>
      )}
      <div className="route-error__actions">
        <button type="button" className="btn btn--primary" onClick={reset}>
          <RotateCw size={14} style={{ marginRight: 6 }} />
          Try again
        </button>
        <Link href="/" className="btn btn--secondary">
          Go home
        </Link>
      </div>
    </div>
  );
}
