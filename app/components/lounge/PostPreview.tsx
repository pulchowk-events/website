"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import { PostCategory, categoryDisplayMap, categoryIcons } from "@/types/posts";
import Markdown from "@/app/components/ui/Markdown";

interface Props {
  title: string;
  content: string;
  category: PostCategory;
  redirectUrl?: string;
  createdAt?: string;
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function PostPreview({ title, content, category, redirectUrl, createdAt }: Props) {
  const { data: session } = useSession();
  const authorName = session?.user?.name || "You";
  const authorImage = session?.user?.image || "/default-avatar.png";
  const timeLabel = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : "just now";

  return (
    <article className="post-detail post-detail--preview">
      <header className="post-detail__head">
        <span className="cat-chip cat-chip--md">
          <span className="cat-chip__dot" aria-hidden="true" style={{ background: "var(--cat-discussions)" }} />
          {categoryDisplayMap[category]}
        </span>

        <h1 className="post-detail__title">
          {title.trim() || <span style={{ color: "var(--text-3)", fontWeight: 400 }}>Untitled post</span>}
        </h1>

        <div className="post-detail__meta">
          <span className="post-detail__avatar-link">
            <span className="post-detail__avatar">
              <Image src={authorImage} alt={authorName} width={24} height={24} />
            </span>
          </span>
          <span className="post-detail__author">{authorName}</span>
          <span className="post-detail__dot">·</span>
          <span className="post-detail__time">{timeLabel}</span>
        </div>
      </header>

      <div className="post-detail__body">
        {content.trim() ? (
          <Markdown content={content} />
        ) : (
          <p style={{ color: "var(--text-3)", fontStyle: "italic" }}>No content yet.</p>
        )}
      </div>

      {redirectUrl && redirectUrl.trim() && (
        <div className="post-detail__ref">
          <span className="post-detail__ref-domain">
            <ExternalLink size={12} />
            {domainOf(redirectUrl)}
          </span>
          <span className="post-detail__ref-url">{redirectUrl}</span>
        </div>
      )}
    </article>
  );
}
