"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface Props {
  open: boolean;
  email: string | null;
  onClose: () => void;
}

export default function DeleteAccountDialog({ open, email, onClose }: Props) {
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const expected = email?.trim().toLowerCase() ?? "";
  const matches = confirm.trim().toLowerCase() === expected || confirm === "DELETE";
  const canDelete = !!expected && matches && !deleting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/me/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Deletion failed");
      }
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Deletion failed");
      setDeleting(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={(v) => !v && !deleting && onClose()}>
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
            width: "calc(100vw - 32px)", maxWidth: 480, zIndex: 51,
          }}
        >
          <div className="modal__head">
            <AlertDialog.Title className="modal__title" style={{ color: "var(--danger)" }}>
              Delete account
            </AlertDialog.Title>
          </div>
          <div className="modal__body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AlertDialog.Description asChild>
              <div style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.55 }}>
                <p>
                  This permanently deletes your account and <strong style={{ color: "var(--text-1)" }}>all content you have posted</strong> — lounge posts, comments, events, projects, votes, saves. Donations you made are kept in the public ledger but anonymised to &ldquo;Anonymous&rdquo;.
                </p>
                <p style={{ marginTop: 10 }}>
                  This action cannot be undone. A minimal record of the deletion (email, timestamp, content counts) is retained for 365 days for legal and abuse-prevention purposes, then permanently deleted.
                </p>
              </div>
            </AlertDialog.Description>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                Type your email{" "}
                <code style={{ color: "var(--text-1)", fontFamily: "var(--font-geist-mono, monospace)" }}>
                  {expected || "your email"}
                </code>{" "}
                or <code style={{ color: "var(--text-1)", fontFamily: "var(--font-geist-mono, monospace)" }}>DELETE</code> to confirm
              </span>
              <input
                type="text"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
                autoFocus
                disabled={deleting}
                placeholder={expected || "confirmation"}
              />
            </label>
          </div>
          <div className="modal__foot">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={onClose}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--sm"
              onClick={handleDelete}
              disabled={!canDelete}
              style={{
                background: canDelete ? "var(--danger)" : "var(--surface)",
                color: canDelete ? "#fff" : "var(--text-3)",
              }}
            >
              {deleting ? "Deleting…" : "Delete my account"}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
