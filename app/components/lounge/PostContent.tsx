"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, ExternalLink, MessageSquare, Bookmark, Share2, MoreHorizontal, Copy } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import SignInModal from "@/app/components/signIn/SignInModal";
import { PostCategory, categoryDisplayMap, categoryIcons } from "@/types/posts";
import Markdown from "@/app/components/ui/Markdown";
import { PostVoteButton } from "./PostVoteButton";
import { LoungeComments } from "./comments/LoungeComments";
import EditPostModal from "./EditPostModal";
import DeletePostDialog from "./DeletePostDialog";
import ReportModal from "./ReportModal";

interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  redirect_url: string | null;
  image_url: string | null;
  show_embed_image: boolean;
  created_at: string;
  updated_at?: string | null;
  edited_at?: string | null;
  author_id: string;
  score: number | null;
  comment_count: number | null;
  users: { name: string | null; image: string | null; id: string };
}

interface PostContentProps {
  post: Post;
  isAdmin: boolean;
  isAuthor: boolean;
  isSaved: boolean;
  myVote: 1 | -1 | undefined;
  userId?: string;
}

export default function PostContent({ post, isAdmin, isAuthor, isSaved, myVote, userId }: PostContentProps) {
  const { data: session } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);

  const showImage = !!post.image_url && post.show_embed_image && !imageBroken;
  const author = post.users.name || "Anonymous";
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/lounge/" + post.id
      : "https://pulchowkevents.netlify.app/lounge/" + post.id;

  const toggleSave = async () => {
    if (!session?.user?.id || !userId) {
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
        body: JSON.stringify({ item_type: "post", item_id: post.id }),
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

  const copyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch {}
        ta.remove();
      }
      toast.success("Link copied");
      setShareOpen(false);
    } catch {
      toast.error("Could not copy");
    }
  };

  const overflowItems: { label: string; onClick: () => void; tone?: "danger" }[] = [];
  if (isAuthor || isAdmin) {
    overflowItems.push({ label: "Edit post", onClick: () => setEditOpen(true) });
    overflowItems.push({ label: "Delete post", onClick: () => setDeleteOpen(true), tone: "danger" });
  }
  if (!isAuthor) {
    overflowItems.push({ label: "Report", onClick: () => setReportOpen(true) });
  }

  return (
    <>
      <article className="post-detail">
        <Link href="/lounge" className="ev-detail__back">
          <ArrowLeft size={14} />
          Lounge
        </Link>

        <header className="post-detail__head">
          <span className="cat-chip cat-chip--md">
            <span className="cat-chip__dot" aria-hidden="true" style={{ background: "var(--cat-discussions)" }} />
            {categoryDisplayMap[post.category]}
          </span>

          <h1 className="post-detail__title">{post.title}</h1>

          <div className="post-detail__meta">
            <Link href={"/profile/" + post.users.id} className="post-detail__avatar-link">
              <span className="post-detail__avatar">
                <Image
                  src={post.users.image || "/default-avatar.png"}
                  alt={author}
                  width={24}
                  height={24}
                />
              </span>
            </Link>
            <Link href={"/profile/" + post.users.id} className="post-detail__author">{author}</Link>
            <span className="post-detail__dot">·</span>
            <span className="post-detail__time" suppressHydrationWarning>
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
            {post.edited_at && <span className="post-detail__edited">edited</span>}
          </div>
        </header>

        <div className="post-detail__action-bar">
          <PostVoteButton
            postId={post.id}
            initialScore={post.score ?? 0}
            initialVote={myVote}
            orientation="horizontal"
          />
          <a href="#comments" className="post-detail__bar-item">
            <MessageSquare size={14} />
            <span>{post.comment_count ?? 0}</span>
          </a>
          <button
            type="button"
            onClick={toggleSave}
            disabled={saving}
            className={"post-detail__bar-item" + (saved ? " post-detail__bar-item--on" : "")}
            aria-label={saved ? "Unsave" : "Save"}
            aria-pressed={saved}
          >
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
          </button>
          <div className="overflow-wrap">
            <button
              type="button"
              className="post-detail__bar-item"
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
          {overflowItems.length > 0 && (
            <div className="overflow-wrap" style={{ marginLeft: "auto" }}>
              <button
                type="button"
                className="post-detail__bar-item"
                onClick={() => setOverflowOpen((v) => !v)}
                aria-label="More"
              >
                <MoreHorizontal size={14} />
              </button>
              {overflowOpen && (
                <div className="menu" style={{ right: 0, left: "auto" }}>
                  {overflowItems.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      className={"menu__item" + (item.tone === "danger" ? " menu__item--danger" : "")}
                      onClick={() => {
                        setOverflowOpen(false);
                        item.onClick();
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showImage && (
          <div className="post-detail__hero">
            <Image
              src={post.image_url!}
              alt={post.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 720px"
              className="post-detail__hero-img"
              onError={() => setImageBroken(true)}
            />
          </div>
        )}

        <div className="post-detail__body">
          <Markdown content={post.content} />
        </div>

        {post.redirect_url && (
          <a
            href={post.redirect_url}
            target="_blank"
            rel="noopener noreferrer"
            className="post-detail__ref"
          >
            <span className="post-detail__ref-domain">
              <ExternalLink size={12} />
              {new URL(post.redirect_url).hostname.replace("www.", "")}
            </span>
            <span className="post-detail__ref-url">{post.redirect_url}</span>
          </a>
        )}

        <section id="comments" className="post-detail__comments">
          <LoungeComments postId={post.id} />
        </section>
      </article>

      {editOpen && <EditPostModal post={post} onClose={() => setEditOpen(false)} />}
      {deleteOpen && (
        <DeletePostDialog
          postId={post.id}
          postTitle={post.title}
          onClose={() => setDeleteOpen(false)}
        />
      )}
      {reportOpen && (
        <ReportModal
          postId={post.id}
          postTitle={post.title}
          onClose={() => setReportOpen(false)}
        />
      )}

      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
