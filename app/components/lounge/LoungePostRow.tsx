"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { PostVoteButton } from "./PostVoteButton";
import { CategoryChip } from "@/app/components/shell/CategoryChip";
import { SaveButton } from "@/app/components/shell/SaveButton";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/app/components/ui/Avatar";
import { SmartImg } from "@/app/components/ui/SmartImg";

interface Post {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  created_at: string;
  image_url: string | null;
  show_embed_image: boolean | null;
  score: number | null;
  comment_count: number | null;
  author_id: string | null;
  users?: { name: string | null; image: string | null } | null;
}

interface Props {
  post: Post;
  myVote: 1 | -1 | undefined;
  saved: boolean;
  density: "comfortable" | "compact";
  isOwner?: boolean;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

function plain(md: string | null): string {
  if (!md) return "";
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~#>]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function LoungePostRow({ post, myVote, saved, density, isOwner, isAdmin, onDelete }: Props) {
  const { data: session } = useSession();
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shareOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [shareOpen]);

  const hasImage = density === "comfortable" && !!post.image_url && post.show_embed_image !== false;
  const excerpt = density === "comfortable" ? plain(post.content).slice(0, 180) : "";
  const canManage = isOwner || isAdmin;

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/lounge/" + post.id
      : "https://pulchowkevents.netlify.app/lounge/" + post.id;

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
    <div className={"lprow" + (density === "compact" ? " lprow--compact" : "")}>
      <PostVoteButton
        postId={post.id}
        initialScore={post.score ?? 0}
        initialVote={myVote}
      />

      <Link href={"/lounge/" + post.id} className="lprow__link">
        <div className="lprow__body">
          {post.category && <CategoryChip category={post.category} />}
          <p className="row-title">{post.title}</p>
          {excerpt && <p className="row-excerpt">{excerpt}</p>}
          <div className="row-meta">
            <span className="row-avatar">
              <Avatar src={post.users?.image} name={post.users?.name} size={16} />
            </span>
            <span>{post.users?.name || "Anonymous"}</span>
            <span className="row-dot">·</span>
            <span suppressHydrationWarning>
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
            <span className="row-dot">·</span>
            <span className="lprow__comments">
              <MessageSquare size={11} /> {post.comment_count ?? 0}
            </span>
          </div>
        </div>
        {hasImage && (
          <span className="lprow__thumb">
            <SmartImg src={post.image_url} alt="" seed={post.id} className="post-row__thumb-img" fallback={<span className="post-row__thumb-initial">{(post.title || "?").charAt(0).toUpperCase()}</span>} />
          </span>
        )}
      </Link>

      <div className="lprow__actions" onClick={(e) => e.stopPropagation()}>
        <SaveButton itemType="post" itemId={post.id} initialSaved={saved} />
        <div className="overflow-wrap" ref={shareRef}>
          <button
            type="button"
            className="row-icon-btn"
            onClick={() => setShareOpen((v) => !v)}
            aria-label="Share"
          >
            <Share2 size={14} />
          </button>
          {shareOpen && (
            <div className="menu">
              <button type="button" className="menu__item" onClick={copyLink}>Copy link</button>
            </div>
          )}
        </div>
        {canManage && (
          <button
            type="button"
            className="row-icon-btn"
            onClick={() => {
              if (onDelete) onDelete(post.id);
              else window.location.href = "/lounge/" + post.id;
            }}
            aria-label="More"
          >
            <MoreHorizontal size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
