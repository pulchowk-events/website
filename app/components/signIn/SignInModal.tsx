"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { SignInContent } from "./SignInContent";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: Props) {
  const [callbackUrl, setCallbackUrl] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCallbackUrl(window.location.pathname + window.location.search);
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="signin-backdrop" />
        <Dialog.Content
          className="signin-panel"
          onClick={(e) => e.stopPropagation()}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Sign in</Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" className="signin-panel__close" aria-label="Close">
              <X size={16} />
            </button>
          </Dialog.Close>
          <SignInContent callbackUrl={callbackUrl} layout="modal" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
