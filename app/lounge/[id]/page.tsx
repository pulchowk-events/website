import React from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/app/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import PostContent from '@/app/components/lounge/PostContent';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: postId } = await params;

  if (!postId) {
    return {
      title: 'Post Not Found | Pulchowk Events'
    };
  }

  const supabase = createServerSupabaseClient();
  const { data: post } = await supabase
    .from('lounge_posts')
    .select('title')
    .eq('id', postId)
    .single();

  return {
    title: post?.title ? `${post.title} | Pulchowk Events` : 'Loading... | Pulchowk Events'
  };
}

export default async function PostPage({ params }: Props) {
  const { id: postId } = await params;

  if (!postId || typeof postId !== 'string') {
    return notFound();
  }

  const supabase = createServerSupabaseClient();
  const session = await getServerSession(authOptions);

  const { data: post, error } = await supabase
    .from('lounge_posts')
    .select(`
      *,
      users:author_id (
        name,
        image,
        email,
        id
      )
    `)
    .eq('id', postId)
    .single();

  if (error || !post) {
    console.error("Post fetch error:", error);
    return notFound();
  }

  const { data: adminData } = await supabase
    .from('admins')
    .select('email')
    .eq('email', session?.user?.email)
    .single();

  const isAdmin = !!adminData;
  const isAuthor = session?.user?.id === post.author_id;

  return (
    <Layout>
      <div className="max-w-7xl min-h-200 mx-auto py-16 px-8">
        <PostContent 
          post={post} 
          isAdmin={isAdmin} 
          isAuthor={isAuthor} 
        />
      </div>
    </Layout>
  );
}