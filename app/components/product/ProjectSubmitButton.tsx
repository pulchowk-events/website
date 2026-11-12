"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import AddProductModal from "./AddProductModal";
import SignInModal from "@/app/components/signIn/SignInModal";

export function ProjectSubmitButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    setAddOpen(sp.get("showAddProduct") === "true");
  }, [sp]);

  const open = () => {
    if (!session?.user?.id) {
      setSignInOpen(true);
      return;
    }
    setAddOpen(true);
    const next = new URLSearchParams(sp.toString());
    next.set("showAddProduct", "true");
    router.replace(pathname + "?" + next.toString());
  };

  const close = () => {
    setAddOpen(false);
    const next = new URLSearchParams(sp.toString());
    next.delete("showAddProduct");
    router.replace(pathname + (next.toString() ? "?" + next.toString() : ""));
  };

  return (
    <>
      <button type="button" className="btn btn--primary btn--sm" onClick={open}>
        Submit project
      </button>
      {addOpen && <AddProductModal onClose={close} />}
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
