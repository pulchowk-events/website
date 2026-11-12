"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import SignInModal from "@/app/components/signIn/SignInModal";

export function SavedGuestCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="saved-guest">
        <span className="saved-guest__icon">
          <Bookmark size={20} />
        </span>
        <h2 className="saved-guest__title">Sign in to see your saves</h2>
        <p className="saved-guest__desc">
          Tap the bookmark on any event, job, post, or project and it shows up here.
        </p>
        <button type="button" className="btn btn--primary" onClick={() => setOpen(true)}>
          Sign in
        </button>
      </div>
      <SignInModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
