import type { CSSProperties } from "react";
import Link from "next/link";
import { slugOf } from "@/app/lib/clubs";
import { Avatar } from "@/app/components/ui/Avatar";
import { formatDateShort } from "@/app/lib/formatDate";
import type { ClubPost } from "@/app/lib/queries";

const SNIPPET_MAX = 280;

function snippet(s: string | null): string {
  const t = (s || "").replace(/\s+/g, " ").trim();
  return t.length > SNIPPET_MAX ? t.slice(0, SNIPPET_MAX).trimEnd() + "..." : t;
}

function hueFor(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

function InstagramGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function ClubPostCard({
  post,
  index,
  linkClub = true,
}: {
  post: ClubPost;
  index: number;
  linkClub?: boolean;
}) {
  const name = post.club?.display_name || post.club?.username || post.club_username;
  const caption = snippet(post.caption) || "(no caption)";
  const hasImage = !!post.image_url;
  const safeUrl = post.post_url && post.post_url.startsWith("https://") ? post.post_url : null;
  const badge = post.is_event ? "Event" : post.post_type || null;
  const hue = hueFor(name);
  const tint = hasImage
    ? undefined
    : {
        background:
          "linear-gradient(135deg, hsl(" + hue + " 55% 30%), hsl(" + ((hue + 45) % 360) + " 60% 14%))",
      };
  const style = { "--i": Math.min(index, 8) } as CSSProperties;

  return (
    <article className="club-card" style={style} tabIndex={0}>
      <div className="club-card__media" style={tint}>
        {hasImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url as string}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="club-card__img"
            />
            <span className="club-card__shade" aria-hidden="true" />
          </>
        )}

        <header className="club-card__head">
          {linkClub ? (
            <Link href={"/clubs/" + slugOf(post.club?.username || post.club_username)} className="club-card__who">
              <Avatar src={post.club?.avatar_url} name={name} size={28} />
              <span className="club-card__name">{name}</span>
            </Link>
          ) : (
            <>
              <Avatar src={post.club?.avatar_url} name={name} size={28} />
              <span className="club-card__name">{name}</span>
            </>
          )}
          {safeUrl && (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="club-card__ig"
              aria-label="View on Instagram (opens in a new tab)"
              title="View on Instagram"
            >
              <InstagramGlyph />
            </a>
          )}
          <time className="club-card__time" dateTime={post.posted_at} title={formatDateShort(post.posted_at)}>
            {post.ago || formatDateShort(post.posted_at)}
          </time>
        </header>

        <div className="club-card__panel">
          {badge && <span className="club-card__badge">{badge}</span>}
          {safeUrl ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="club-card__captionlink"
              tabIndex={-1}
            >
              <p className="club-card__caption">{caption}</p>
            </a>
          ) : (
            <p className="club-card__caption">{caption}</p>
          )}
        </div>
      </div>
    </article>
  );
}
