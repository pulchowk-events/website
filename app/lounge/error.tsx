"use client";
import { RouteError } from "@/app/components/errors/RouteError";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} title="Lounge couldn't load" />;
}
