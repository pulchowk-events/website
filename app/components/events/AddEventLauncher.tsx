"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import AddEventModal from "./AddEventModal";

export function AddEventLauncher() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(sp.get("showAddEvent") === "true");
  }, [sp]);

  const close = () => {
    setOpen(false);
    const next = new URLSearchParams(sp.toString());
    next.delete("showAddEvent");
    router.replace(pathname + (next.toString() ? "?" + next.toString() : ""));
  };

  if (!open) return null;
  return <AddEventModal onClose={close} />;
}
