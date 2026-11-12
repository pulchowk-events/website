"use client";

import { useState } from "react";
import { ExternalLink, Bookmark, Share2, MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import SignInModal from "@/app/components/signIn/SignInModal";
import { ProjectVoteButton } from "./ProjectVoteButton";
import { RemoveButton } from "./RemoveProduct";

interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  image_url: string | null;
  redirect_url: string | null;
  votes: number | null;
  posted_by: string;
}

interface Props {
  product: Product;
  isSaved: boolean;
  isAdmin: boolean;
  onEdit?: () => void;
}

export function ProjectDetailActions({ product, isSaved, isAdmin, onEdit }: Props) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const isOwner = session?.user?.id === product.posted_by;
  const canManage = isAdmin || isOwner;

  const toggleSave = async () => {
    if (!session?.user?.id) {
      setSignInOpen(true);
      return;
    }
    setSaving(true);
    const next = !saved;
    setSaved(next);
    try {
      const res = await fetch("/api/saves", {
        method: next ? "PUT" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_type: "project", item_id: String(product.id) }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Saved" : "Removed from Saved");
    } catch {
      setSaved(!next);
      toast.error("Could not save");
    } finally {
      setSaving(false);
    }
  };

  const shareUrl = typeof window !== "undefined"
    ? window.location.origin + "/product-hunt/" + product.url
    : "https://pulchowkevents.netlify.app/product-hunt/" + product.url;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
      setShareOpen(false);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="pd-actions">
      <ProjectVoteButton productId={product.id} initialVotes={product.votes || 0} />
      {product.redirect_url && (
        <a
          href={product.redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
        >
          <ExternalLink size={14} style={{ marginRight: 8 }} />
          Visit
        </a>
      )}
      <button
        type="button"
        onClick={toggleSave}
        disabled={saving}
        className={"row-icon-btn" + (saved ? " row-icon-btn--on" : "")}
        aria-label={saved ? "Unsave" : "Save"}
        aria-pressed={saved}
      >
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
      </button>
      <div className="overflow-wrap">
        <button
          type="button"
          className="row-icon-btn"
          onClick={() => setShareOpen((v) => !v)}
          aria-label="Share"
        >
          <Share2 size={16} />
        </button>
        {shareOpen && (
          <div className="menu">
            <button type="button" className="menu__item" onClick={copyLink}>Copy link</button>
          </div>
        )}
      </div>
      {canManage && (
        <>
          <button type="button" className="btn btn--secondary" onClick={onEdit}>
            Edit project
          </button>
          <RemoveButton productId={product.id} productName={product.name} isOwner={isOwner} />
        </>
      )}
      {canManage && (
        <button type="button" className="row-icon-btn" aria-label="More" style={{ display: "none" }}>
          <MoreHorizontal size={16} />
        </button>
      )}
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
