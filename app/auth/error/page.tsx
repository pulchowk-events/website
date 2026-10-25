// app/auth/error/page.tsx
import ErrorContent from "./error-content";
import { Suspense } from "react";

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}