import Link from "next/link";
import { Avatar } from "@/app/components/ui/Avatar";
import { formatDateShort } from "@/app/lib/formatDate";
import { slugOf } from "@/app/lib/clubs";
import type { ClubInfo } from "@/app/lib/queries";

const SNIPPET_MAX = 160;

function snippet(s: string | null | undefined): string {
  const t = (s || "").replace(/\s+/g, " ").trim();
  return t.length > SNIPPET_MAX ? t.slice(0, SNIPPET_MAX).trimEnd() + "..." : t;
}

export function ClubRow({ club }: { club: ClubInfo }) {
  const name = club.display_name || club.username;
  return (
    <Link href={"/clubs/" + slugOf(club.username)} className="row club-row">
      <Avatar src={club.avatar_url} name={name} size={36} />
      <div className="club-row__body">
        <p className="row-title">{name}</p>
        <div className="row-meta">
          <span>@{club.username}</span>
        </div>
      </div>
    </Link>
  );
}

interface ClubPostRowProps {
  post: {
    id: string;
    club_username: string;
    caption: string | null;
    post_url: string;
    posted_at: string;
    club: ClubInfo | null;
  };
}

export function ClubPostRow({ post }: ClubPostRowProps) {
  const name = post.club?.display_name || post.club?.username || post.club_username;
  const text = snippet(post.caption) || "(no caption)";
  const safeUrl = post.post_url && post.post_url.startsWith("https://") ? post.post_url : null;
  const inner = (
    <>
      <Avatar src={post.club?.avatar_url} name={name} size={36} />
      <div className="clubpost-row__body">
        <p className="row-title">{text}</p>
        <div className="row-meta">
          <span>{name}</span>
          <span className="row-dot">&middot;</span>
          <time dateTime={post.posted_at}>{formatDateShort(post.posted_at)}</time>
        </div>
      </div>
    </>
  );
  if (safeUrl) {
    return (
      <a href={safeUrl} target="_blank" rel="noopener noreferrer nofollow" className="row clubpost-row">
        {inner}
      </a>
    );
  }
  return (
    <Link href={"/clubs/" + slugOf(post.club?.username || post.club_username)} className="row clubpost-row">
      {inner}
    </Link>
  );
}
