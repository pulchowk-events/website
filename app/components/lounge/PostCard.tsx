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
    <div className="bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/30 p-4 sm:p-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/10 flex flex-col h-full group">
      {/* Category badge - always visible */}
      <div className="mb-3">
        <span className="inline-flex items-center gap-1.5 bg-zinc-900/80 text-zinc-300 px-2.5 py-1 rounded-full text-xs font-medium">
          {categoryIcons[post.category]} {categoryDisplayMap[post.category]}
        </span>
      </div>
      
      <Link href={`/lounge/${post.id}`} className="flex-grow">
        <h3 className="text-lg sm:text-xl font-bold mb-2  transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-zinc-400 text-sm sm:text-base line-clamp-3 mb-4">
          {post.content}
        </p>
      </Link>
      
      <div className="mt-auto pt-4 border-t border-zinc-700/30">
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
              <span className="font-medium text-zinc-300 truncate">
                {post.users.name}
              </span>
              
              <span className="hidden xs:block text-zinc-500">•</span>
              
              <span className="text-zinc-500">
                {formatDistanceToNow(new Date(post.created_at))} ago
              </span>
            </div>
          </div>
          
          <Link 
            href={`/lounge/${post.id}`}
            className="flex-shrink-0 p-1.5 bg-zinc-700/50 hover:bg-green-600/90 rounded-full transition-colors"
            aria-label="View post"
          >
            <ArrowRight className="w-4 h-4 text-zinc-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}