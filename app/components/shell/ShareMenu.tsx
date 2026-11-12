"use client";

import { Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  url: string;
  title: string;
}

export function ShareMenu({ url, title }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch {}
        ta.remove();
      }
      toast.success("Link copied");
      setOpen(false);
    } catch {
      toast.error("Could not copy");
    }
  };

  const whatsapp = () => {
    const link = "https://wa.me/?text=" + encodeURIComponent(title + " " + url);
    window.open(link, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className="overflow-wrap" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="Share"
        className="row-icon-btn"
      >
        <Share2 size={16} />
      </button>
      {open && (
        <div className="menu">
          <button type="button" className="menu__item" onClick={copyLink}>Copy link</button>
          <button type="button" className="menu__item" onClick={whatsapp}>Share to WhatsApp</button>
        </div>
      )}
    </div>
  );
}
