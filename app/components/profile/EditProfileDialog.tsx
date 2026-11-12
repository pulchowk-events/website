"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialBio: string | null;
}

export function EditProfileDialog({ isOpen, onClose, initialName, initialBio }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setBio(initialBio || "");
    }
  }, [isOpen, initialName, initialBio]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      toast.success("Profile updated");
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="modal-backdrop">
      <Dialog.Panel
        className="modal"
        style={{ maxWidth: 460 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <header className="modal__head">
          <Dialog.Title className="modal__title">Edit profile</Dialog.Title>
          <button type="button" onClick={onClose} className="modal__close" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={submit}>
          <div className="modal__body">
            <label className="field">
              <span className="field__label">Name</span>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                required
                disabled={saving}
              />
            </label>

            <label className="field">
              <span className="field__label">
                Bio <span style={{ color: "var(--text-3)", fontWeight: 400 }}>({bio.length}/160)</span>
              </span>
              <textarea
                className="input input--multi"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                rows={3}
                maxLength={160}
                placeholder="A short line about you"
                disabled={saving}
              />
            </label>
          </div>

          <div className="modal__foot">
            <button type="button" onClick={onClose} className="btn btn--secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}
