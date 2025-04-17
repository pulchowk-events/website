import { Suspense } from "react";
import { SignInPage } from "./SignInPage"

export default function SignInPageWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <SignInPage />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Loading...
    </div>
  );
}
