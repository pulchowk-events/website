import Link from "next/link";
import Image from "next/image";
import { CategoryChip } from "../CategoryChip";
import { formatDistanceToNow } from "date-fns";

interface PostRowProps {
  post: {
    id: string;
    title: string;
    content: string | null;
    category: string | null;
    created_at: string;
    image_url?: string | null;
    users?: { name: string | null; image: string | null } | null;
  };
  showThumb?: boolean;
  showExcerpt?: boolean;
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

export function PostRow({ post, showThumb = true, showExcerpt = true }: PostRowProps) {
  const hasImg = showThumb && !!post.image_url;
  const excerpt = showExcerpt ? plain(post.content).slice(0, 160) : "";
  return (
    <Link href={"/lounge/" + post.id} className="row post-row">
      <div className="post-row__body">
        {post.category && <CategoryChip category={post.category} />}
        <p className="row-title">{post.title}</p>
        {excerpt && <p className="row-excerpt">{excerpt}</p>}
        <div className="row-meta">
          <span className="row-avatar">
            <Image src={post.users?.image || "/default-avatar.png"} alt="" width={16} height={16} />
          </span>
          <span>{post.users?.name || "Anonymous"}</span>
          <span className="row-dot">·</span>
          <span suppressHydrationWarning>
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
      {hasImg && (
        <span
          className="row-thumb"
          style={{ display: "block", position: "relative", width: 72, height: 72, overflow: "hidden", flex: "none", borderRadius: 8, background: "var(--surface)" }}
        >
          <Image src={post.image_url!} alt="" fill sizes="72px" unoptimized style={{ objectFit: "cover" }} />
        </span>
      )}
    </Link>
  );
}
