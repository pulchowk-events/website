"use client";
import { RouteError } from "@/app/components/errors/RouteError";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} title="Search couldn't load" />;
}
