import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';
import { ArrowRight } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  category: PostCategory;
  users: {
    name: string;
    image: string | null;
    id: string;
  };
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-card hover:bg-accent/30 border border-border p-4 sm:p-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/10 flex flex-col h-full group">
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

        <p className="text-muted-foreground text-sm sm:text-base line-clamp-3 mb-4">
          {post.content}
        </p>
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
  );
}