'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';
import { ArrowRight } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  category: PostCategory;
  image_url?: string | null;
  show_embed_image?: boolean;
  redirect_url?: string | null;
  users: {
    name: string;
    image: string | null;
    id: string;
  };
}

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|ico)(\?.*)?$/i;
function looksLikeImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return IMAGE_EXT.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

export default function PostCard({ post }: { post: Post }) {
  const [imageBroken, setImageBroken] = useState(false);

  const imageSrc =
    post.image_url ||
    (post.show_embed_image !== false && looksLikeImageUrl(post.redirect_url)
      ? post.redirect_url
      : null);

  const showImage = !!imageSrc && post.show_embed_image !== false && !imageBroken;

  return (
    <article className="post-card">
      {showImage && (
        <Link
          href={'/lounge/' + post.id}
          className="post-card__media"
          aria-label={post.title}
        >
          <Image
            src={imageSrc!}
            alt={post.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="post-card__img"
            onError={() => setImageBroken(true)}
          />
        </Link>
      )}

      <div className="post-card__body">
        <span className="tag post-card__cat" style={{ '--c': 'var(--c)' } as React.CSSProperties}>
          {categoryIcons[post.category]} {categoryDisplayMap[post.category]}
        </span>

        <Link href={'/lounge/' + post.id} className="post-card__title-link">
          <h3 className="post-card__title">{post.title}</h3>
          {!showImage && <p className="post-card__excerpt">{post.content}</p>}
        </Link>

        <footer className="post-card__foot">
          <Link
            href={'/profile/' + post.users.id}
            className="post-card__avatar-link"
            aria-label={post.users.name}
          >
            <span className="post-card__avatar">
              <Image
                src={post.users.image || '/default-avatar.png'}
                alt={post.users.name}
                fill
                sizes="28px"
                className="post-card__avatar-img"
              />
            </span>
          </Link>

          <div className="post-card__meta">
            <span className="post-card__author">{post.users.name}</span>
            <span className="post-card__dot">•</span>
            <span className="post-card__time" suppressHydrationWarning>
              {formatDistanceToNow(new Date(post.created_at))} ago
            </span>
          </div>

          <Link
            href={'/lounge/' + post.id}
            className="post-card__arrow"
            aria-label="View post"
          >
            <ArrowRight size={14} />
          </Link>
        </footer>
      </div>
    </article>
  );
}
