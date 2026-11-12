"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SignInModal from "@/app/components/signIn/SignInModal";

export function FloatingCreate() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const trigger = () => {
    if (!session) { setSignInOpen(true); return; }
    setOpen((v) => !v);
  };

  return (
    <>
      <div className="fab" ref={ref}>
        <button type="button" className="fab__btn" onClick={trigger} aria-label="Create"><Plus size={22} /></button>
        {open && (
          <div className="menu fab__menu">
            <Link href="/lounge/new" className="menu__item" onClick={() => setOpen(false)}>Post</Link>
            <Link href="/events/new" className="menu__item" onClick={() => setOpen(false)}>Event</Link>
            <Link href="/product-hunt/new" className="menu__item" onClick={() => setOpen(false)}>Project</Link>
          </div>
        )}
      </div>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
