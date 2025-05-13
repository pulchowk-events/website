import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  category: PostCategory;
  users: {
    name: string;
    image: string | null;
  };
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-gray-800 hover:bg-gray-800/95 p-6 rounded-lg">
      <div className="flex flex-col gap-2">
        <Link href={`/lounge/${post.id}`}>
          <h3 className="text-xl font-bold hover:text-white/80 transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-400 line-clamp-2">{post.content}</p>
        <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                    <img src={post.users.image || '/default-avatar.png'} alt={post.users.name} className="w-6 h-6 rounded-full" />
                    <span>{post.users.name}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                    <span>•</span>
                    <span className="capitalize">
                        {categoryIcons[post.category]} {categoryDisplayMap[post.category]}
                    </span>
                    </div>
        </div>
      </div>
    </div>
  );
}