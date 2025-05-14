'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';
import EditPostModal from './EditPostModal';
import DeletePostDialog from './DeletePostDialog';
import { LoungeComments } from './comments/LoungeComments';

interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  redirect_url: string | null;
  created_at: string;
  author_id: string;
  users: {
    name: string;
    image: string | null;
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

  return (
    <>
    <div className="flex flex-col md:flex-row gap-8">
      {/* Author Info Section */}
      <div className="w-full md:w-48 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={post.users.image || '/default-avatar.png'}
                alt={post.users.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h3 className="font-medium text-lg">{post.users.name}</h3>
            <span className="text-sm text-zinc-400">
              {formatDistanceToNow(new Date(post.created_at))} ago
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow max-w-3xl">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 bg-zinc-800/50 text-zinc-300 px-3 py-1.5 rounded-full text-sm">
            {categoryIcons[post.category]} {categoryDisplayMap[post.category]}
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

        <div className="prose prose-invert max-w-none mb-8">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {post.redirect_url && (
          <div className="mt-8 p-4 bg-zinc-800/50 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Reference Link</h3>
            <Link 
              href={post.redirect_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={16} />
              <span className="text-sm break-all">{post.redirect_url}</span>
            </Link>
          </div>
        )}

        {/* Admin/Author Actions */}
        {(isAdmin || isAuthor) && (
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <div className="flex gap-4">
              {showEditModal && (
                <EditPostModal
                  post={post}
                  onClose={() => setShowEditModal(false)}
                />
              )}
              <DeletePostDialog
                postId={post.id}
                postTitle={post.title}
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
              />
              <button 
                onClick={() => setShowEditModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit Post
              </button>
              <button 
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    <div className="mt-12">
      <LoungeComments postId={post.id} />
    </div>
    </>
  );
}