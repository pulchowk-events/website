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
  users: {
    name: string;
    image: string | null;
    id: string;
  };
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
      <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
        {/* Author column */}
        <div className="w-full md:w-48 flex-shrink-0 mb-6 md:mb-0">
          <div className="md:sticky md:top-24">
            <div className="flex flex-row md:flex-col items-center text-center gap-4 md:gap-0">
              <Link href={`/profile/${post.users.id}`}>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 md:mb-4 flex-shrink-0">
                  <Image
                    src={post.users.image || '/default-avatar.png'}
                    alt={post.users.name}
                    fill
                    className="rounded-full object-cover border-2 border-border shadow-lg"
                  />
                </div>
              </Link>
              <div className="md:w-full">
                <h3 className="font-medium text-base sm:text-lg text-foreground text-left md:text-center">
                  {post.users.name}
                </h3>
                <span className="text-xs sm:text-sm text-muted-foreground text-left md:text-center block">
                  {formatDistanceToNow(new Date(post.created_at))} ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content column */}
        <div className="flex-grow max-w-3xl">
          <div className="mb-4 sm:mb-6">
            <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium">
              {categoryIcons[post.category]} {categoryDisplayMap[post.category]}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
            {post.title}
          </h1>

          {/* Hero image — full width below title, above body */}
          {showImage && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted mb-6 sm:mb-8 border border-border">
              <Image
                src={post.image_url!}
                alt={post.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                onError={() => setImageBroken(true)}
              />
            </div>
          )}

          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-6 sm:mb-8">
            <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap text-foreground">
              {post.content}
            </p>
          </div>

          {post.redirect_url && (
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border backdrop-blur-sm">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Reference Link</h3>
              <Link
                href={post.redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <ExternalLink size={16} />
                <span className="text-xs sm:text-sm break-all">{post.redirect_url}</span>
              </Link>
            </div>
          )}

          {(isAdmin || isAuthor) && (
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {showEditModal && (
                  <EditPostModal
                    post={post}
                    onClose={() => setShowEditModal(false)}
                  />
                )}
                {showDeleteDialog && (
                  <DeletePostDialog
                    postId={post.id}
                    postTitle={post.title}
                    onClose={() => setShowDeleteDialog(false)}
                  />
                )}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Pencil size={16} />
                  Edit Post
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Post
                </button>
              </div>
            </div>
          )}

          {!isAuthor && session?.user && (
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-2 mt-6 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <Flag className="w-4 h-4" />
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

      <div className="mt-8 sm:mt-12 pt-6 border-t border-border">
        <LoungeComments postId={post.id} />
      </div>
    </>
  );
}