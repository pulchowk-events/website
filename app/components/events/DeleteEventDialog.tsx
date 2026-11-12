"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface Props {
  eventId: string | null;
  eventTitle: string;
  onClose: () => void;
}

export default function DeleteEventDialog({ eventId, eventTitle, onClose }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!eventId) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/events/remove?id=" + eventId, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Event deleted");
      onClose();
      router.refresh();
    } catch {
      toast.error("Could not delete event");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog.Root open={!!eventId} onOpenChange={(v) => !v && onClose()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)",
          }}
        />
        <AlertDialog.Content
          className="modal"
          style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "calc(100vw - 32px)", maxWidth: 420, zIndex: 51,
          }}
        >
          <header className="modal__head">
            <AlertDialog.Title className="modal__title">Delete event</AlertDialog.Title>
          </header>
          <div className="modal__body">
            <AlertDialog.Description style={{ fontSize: 14, lineHeight: 1.5, color: "var(--text-2)" }}>
              Delete &ldquo;{eventTitle}&rdquo;? This cannot be undone.
            </AlertDialog.Description>
          </div>
          <div className="modal__foot">
            <AlertDialog.Cancel asChild>
              <button type="button" className="btn btn--secondary">Cancel</button>
            </AlertDialog.Cancel>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn--primary"
              style={{ background: "var(--danger)", color: "var(--text-1)" }}
            >
              {deleting ? "Deleting…" : "Delete event"}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
