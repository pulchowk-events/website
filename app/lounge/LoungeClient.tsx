'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PostCard from '@/app/components/lounge/PostCard';
import AddPostModal from '@/app/components/lounge/AddPostModal';
import CategoryFilter from '@/app/components/lounge/CategoryFilter';
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
    setSelectedCategories((prev) => {
      if (prev.includes(category)) return prev.filter((c) => c !== category);
      return [...prev, category];
    });
    setPage(1);
  };

  const fetchPosts = async (pageNum: number) => {
    try {
      setLoading(true);
      const categoryQuery =
        selectedCategories.length > 0 ? '&categories=' + selectedCategories.join(',') : '';
      const response = await fetch(
        '/api/lounge/posts/get?page=' + pageNum + '&limit=6' + categoryQuery
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch posts');

      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => {
          const newPosts = data.posts.filter(
            (p: Post) => !prev.some((existing) => existing.id === p.id)
          );
          return [...prev, ...newPosts];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const closeAddPostModal = () => {
    setShowModal(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('showAddPost');
      window.history.replaceState({}, '', url.toString());
    }
    fetch('/api/lounge/posts/get?page=1')
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts);
        setPage(1);
        setHasMore(1 < data.totalPages);
      })
      .catch((err) => console.error('Background refresh failed:', err));
  };

  return (
    <>
      {showSignInModal && (
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
        />
      )}

      {showModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <AddPostModal onClose={closeAddPostModal} />,
          document.getElementById('portal-root')! || document.body
        )}

      <div className="lounge-toolbar">
        <button type="button" onClick={openAddPostModal} className="btn btn--primary">
          <span className="btn__label">Add post</span>
          <span className="btn__label btn__label--dup" aria-hidden="true">
            Add post
          </span>
        </button>
      </div>

      <CategoryFilter
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
      />

      {loading && posts.length === 0 ? (
        <div className="lounge-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 220 }} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="lounge-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: 16 }}>
          <p className="empty-state__title">No posts match these filters.</p>
          <p className="empty-state__desc">
            Try a different category, or write the first one.
          </p>
        </div>
      )}

      {hasMore && (
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="btn btn--secondary"
          >
            <span className="btn__label">
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" style={{ marginRight: 8 }} />
                  Loading
                </>
              ) : (
                'Load more'
              )}
            </span>
            <span className="btn__label btn__label--dup" aria-hidden="true">
              {loading ? 'Loading' : 'Load more'}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
