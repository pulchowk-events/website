'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import PostCard from '../lounge/PostCard';
import type { Post } from '@/app/api/lounge/posts/get/route';

export default function UserPosts({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`/api/users/${userId}/posts`);
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        No posts yet
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post}/>
      ))}
    </div>
  );
}