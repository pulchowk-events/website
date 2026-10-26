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

  // Fallback to redirect_url if image_url is empty (for older posts / direct image URLs)
  const imageSrc =
    post.image_url ||
    (post.show_embed_image !== false && looksLikeImageUrl(post.redirect_url)
      ? post.redirect_url
      : null);

  const showImage = !!imageSrc && post.show_embed_image !== false && !imageBroken;

  return (
    <div className="bg-card hover:bg-accent/30 border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-green-900/10 flex flex-col h-full group">
      {/* Image banner — only when present and not broken */}
      {showImage && (
        <Link
          href={`/lounge/${post.id}`}
          className="block relative w-full aspect-video bg-muted overflow-hidden"
          aria-label={post.title}
        >
          <Image
            src={imageSrc!}
            alt={post.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => setImageBroken(true)}
          />
        </Link>
      )}

      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        {/* Category badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium">
            {categoryIcons[post.category]} {categoryDisplayMap[post.category]}
          </span>
        </div>

        <Link href={`/lounge/${post.id}`} className="flex-grow">
          <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground transition-colors line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400">
            {post.title}
          </h3>

          {/* Description — only when there's no image */}
          {!showImage && (
            <p className="text-muted-foreground text-sm sm:text-base line-clamp-3 mb-4">
              {post.content}
            </p>
          )}
        </Link>

        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${post.users.id}`}
              className="hover:opacity-80 transition-opacity"
            >
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src={post.users.image || '/default-avatar.png'}
                  alt={post.users.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            </Link>

            <div className="flex-grow min-w-0">
              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs">
                <span className="font-medium text-foreground truncate">
                  {post.users.name}
                </span>
                <span className="hidden xs:block text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at))} ago
                </span>
              </div>
            </div>

            <Link
              href={`/lounge/${post.id}`}
              className="flex-shrink-0 p-1.5 bg-muted hover:bg-green-600 rounded-full transition-colors group/arrow"
              aria-label="View post"
            >
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/arrow:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}