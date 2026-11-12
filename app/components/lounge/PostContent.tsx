'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Pencil, Trash2, Flag } from 'lucide-react';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';
import EditPostModal from './EditPostModal';
import DeletePostDialog from './DeletePostDialog';
import { LoungeComments } from './comments/LoungeComments';
import ReportModal from './ReportModal';
import { useSession } from 'next-auth/react';
import Markdown from '@/app/components/ui/Markdown';

interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  redirect_url: string | null;
  image_url: string | null;
  show_embed_image: boolean;
  created_at: string;
  author_id: string;
  users: { name: string; image: string | null; id: string };
}

interface PostContentProps {
  post: Post;
  isAdmin: boolean;
  isAuthor: boolean;
}

export default function PostContent({ post, isAdmin, isAuthor }: PostContentProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data: session } = useSession();
  const [showReportModal, setShowReportModal] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);

  const showImage = !!post.image_url && post.show_embed_image && !imageBroken;

  return (
    <>
      <div className="post-detail">
        <aside className="post-detail__author">
          <Link href={'/profile/' + post.users.id} className="post-detail__avatar-link">
            <span className="post-detail__avatar">
              <Image
                src={post.users.image || '/default-avatar.png'}
                alt={post.users.name}
                fill
                sizes="96px"
                className="post-detail__avatar-img"
              />
            </span>
          </Link>
          <div className="post-detail__author-meta">
            <p className="post-detail__author-name">{post.users.name}</p>
            <p className="post-detail__author-time" suppressHydrationWarning>
              {formatDistanceToNow(new Date(post.created_at))} ago
            </p>
          </div>
        </aside>

        <div className="post-detail__body">
          <span className="tag" style={{ '--c': 'var(--c)' } as React.CSSProperties}>
            {categoryIcons[post.category]} {categoryDisplayMap[post.category]}
          </span>

          <h1 className="post-detail__title">{post.title}</h1>

          {showImage && (
            <div className="post-detail__hero">
              <Image
                src={post.image_url!}
                alt={post.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 768px"
                className="post-detail__hero-img"
                onError={() => setImageBroken(true)}
              />
            </div>
          )}

          <div className="post-detail__content">
            <Markdown content={post.content} />
          </div>

          {post.redirect_url && (
            <div className="post-detail__ref">
              <p className="page-header__eyebrow" style={{ marginBottom: 8 }}>
                Reference link
              </p>
              <Link
                href={post.redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="post-detail__ref-link"
              >
                <ExternalLink size={14} />
                <span className="post-detail__ref-url">{post.redirect_url}</span>
              </Link>
            </div>
          )}

          {(isAdmin || isAuthor) && (
            <div className="post-detail__admin">
              {showEditModal && (
                <EditPostModal post={post} onClose={() => setShowEditModal(false)} />
              )}
              {showDeleteDialog && (
                <DeletePostDialog
                  postId={post.id}
                  postTitle={post.title}
                  onClose={() => setShowDeleteDialog(false)}
                />
              )}
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="btn btn--secondary"
              >
                <span className="btn__label">
                  <Pencil size={14} style={{ marginRight: 8 }} />
                  Edit post
                </span>
                <span className="btn__label btn__label--dup" aria-hidden="true">
                  <Pencil size={14} style={{ marginRight: 8 }} />
                  Edit post
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="btn btn--secondary"
                style={{ color: 'var(--danger)' }}
              >
                <span className="btn__label">
                  <Trash2 size={14} style={{ marginRight: 8 }} />
                  Delete post
                </span>
                <span className="btn__label btn__label--dup" aria-hidden="true">
                  <Trash2 size={14} style={{ marginRight: 8 }} />
                  Delete post
                </span>
              </button>
            </div>
          )}

          {!isAuthor && session?.user && (
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="post-detail__report"
            >
              <Flag size={14} />
              Report
            </button>
          )}

          {showReportModal && (
            <ReportModal
              postId={post.id}
              postTitle={post.title}
              onClose={() => setShowReportModal(false)}
            />
          )}
        </div>
      </div>

      <div className="post-detail__comments">
        <LoungeComments postId={post.id} />
      </div>
    </>
  );
}
