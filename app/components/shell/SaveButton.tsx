"use client";

import { Bookmark } from "lucide-react";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import SignInModal from "@/app/components/signIn/SignInModal";

type ItemType = "post" | "event" | "job" | "project" | "scholarship";

interface Props {
  itemType: ItemType;
  itemId: string;
  initialSaved: boolean;
  compact?: boolean;
  onChange?: (saved: boolean) => void;
}

export function SaveButton({ itemType, itemId, initialSaved, compact = false, onChange }: Props) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const [signInOpen, setSignInOpen] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.id) {
      setSignInOpen(true);
      return;
    }

    const next = !saved;
    setSaved(next);
    onChange?.(next);

    startTransition(async () => {
      try {
        const res = await fetch("/api/saves", {
          method: next ? "PUT" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_type: itemType, item_id: itemId }),
        });
        if (!res.ok) throw new Error("Failed");
        toast.success(next ? "Saved" : "Removed from Saved", {
          duration: 3000,
          action: next
            ? undefined
            : {
                label: "Undo",
                onClick: () => {
                  setSaved(true);
                  onChange?.(true);
                  fetch("/api/saves", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ item_type: itemType, item_id: itemId }),
                  });
                },
              },
        });
      } catch {
        setSaved(!next);
        onChange?.(!next);
        toast.error("Could not save. Try again.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-label={saved ? "Unsave" : "Save"}
        aria-pressed={saved}
        className={"save-btn" + (saved ? " save-btn--on" : "") + (compact ? " save-btn--compact" : "")}
      >
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
      </button>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
