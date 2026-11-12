'use client';

import { useEffect, useState } from 'react';
import PostCard from '../lounge/PostCard';
import type { Post } from '@/app/api/lounge/posts/get/route';

export default function UserPosts({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/users/' + userId + '/posts');
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
      <div className="lounge-grid">
        {[0, 1].map((i) => (
          <div key={i} className="skeleton" style={{ height: 220 }} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No posts yet.</p>
        <p className="empty-state__desc">This user hasn&apos;t shared anything in the lounge.</p>
      </div>
    );
  }

  return (
    <div className="lounge-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
