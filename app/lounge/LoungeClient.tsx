'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostCard from '@/app/components/lounge/PostCard';
import AddPostModal from '@/app/components/lounge/AddPostModal';
import CategoryFilter from '@/app/components/lounge/CategoryFilter';
import { createPortal } from 'react-dom';
import SignInModal from '@/app/components/signIn/SignInModal';
import { Post } from '@/app/api/lounge/posts/get/route';
import { Loader2 } from 'lucide-react';
import { PostCategory } from '@/types/posts';

interface Props {
  initialPosts: Post[];
  userId?: string;
}

export default function LoungeClient({ initialPosts, userId }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<PostCategory[]>([]);
  const isLoggedIn = !!userId;

  useEffect(() => {
    setShowModal(searchParams.get('showAddPost') === 'true');
  }, [searchParams]);

  const handleCategoryToggle = (category: PostCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
    setPage(1);
  };

  const fetchPosts = async (pageNum: number) => {
    try {
      setLoading(true);

      const categoryQuery = selectedCategories.length > 0
        ? `&categories=${selectedCategories.join(',')}`
        : '';

      const response = await fetch(`/api/lounge/posts/get?page=${pageNum}&limit=6${categoryQuery}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prevPosts => {
          const newPosts = data.posts.filter(
            (newPost: Post) => !prevPosts.some(existingPost => existingPost.id === newPost.id)
          );
          return [...prevPosts, ...newPosts];
        });
      }

      setHasMore(pageNum < data.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [selectedCategories]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const openAddPostModal = () => {
    if (!isLoggedIn) {
      setShowSignInModal(true);
      return;
    }
    router.push('?showAddPost=true');
  };

  const closeAddPostModal = async () => {
    router.push('?showAddPost=false');
    try {
      setLoading(true);
      const response = await fetch('/api/lounge/posts/get?page=1');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setPosts(data.posts);
      setPage(1);
      setHasMore(1 < data.totalPages);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showSignInModal && (
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
        />
      )}

      {showModal && typeof document !== 'undefined' &&
        createPortal(
          <AddPostModal onClose={closeAddPostModal} />,
          document.getElementById('portal-root')! || document.body
        )
      }

      <div className="relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Lounge</h1>
          <button
            onClick={openAddPostModal}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Post
          </button>
        </div>

        <CategoryFilter
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />

        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <p className="text-center text-muted-foreground col-span-2">
                No posts found for selected categories.
              </p>
            )}
          </div>
        )}

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-secondary hover:bg-accent text-secondary-foreground px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}