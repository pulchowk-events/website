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
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,.7)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />
        <Dialog.Content
          className="modal"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "calc(100vw - 32px)",
            maxWidth: 400,
            zIndex: 101,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="modal__head">
            <Dialog.Title className="modal__title">Sign in</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="modal__close" aria-label="Close">
                <X size={18} />
              </button>
            </Dialog.Close>
          </header>

          <div className="modal__body">
            <SignInContent callbackUrl={callbackUrl} layout="modal" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
