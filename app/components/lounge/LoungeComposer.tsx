"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import AddPostModal from "./AddPostModal";
import SignInModal from "@/app/components/signIn/SignInModal";

export function LoungeComposer({ userId }: { userId?: string }) {
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const onClick = () => {
    if (!session?.user?.id) {
      setSignInOpen(true);
      return;
    }
    setExpanded(true);
  };

  return (
    <>
      <button type="button" className="composer-stub" onClick={onClick}>
        {session ? "Start a post…" : "Sign in to post"}
      </button>
      {expanded && <AddPostModal onClose={() => setExpanded(false)} />}
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
