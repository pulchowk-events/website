import React from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/app/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import PostContent from '@/app/components/lounge/PostContent';

interface Props {
  params: { id: string };
}

export default async function PostPage({ params }: Props) {
  const postId = params?.id;

  if (!postId || typeof postId !== 'string') {
    return notFound();
  }

  const supabase = createServerSupabaseClient();
  const session = await getServerSession(authOptions);

  // Get post data with author info
  const { data: post, error } = await supabase
    .from('lounge_posts')
    .select(`
      *,
      users:author_id (
        name,
        image,
        email
      )
    `)
    .eq('id', postId)
    .single();

  if (error || !post) {
    console.error("Post fetch error:", error);
    return notFound();
  }

  // Check if user is admin
  const { data: adminData } = await supabase
    .from('admins')
    .select('email')
    .eq('email', session?.user?.email)
    .single();

  const isAdmin = !!adminData;
  const isAuthor = session?.user?.id === post.author_id;

  return (
    <Layout>
      <div className="max-w-7xl min-h-200 mx-auto py-16 px-8 dotted-border-vertical border-x">
        <PostContent 
          post={post} 
          isAdmin={isAdmin} 
          isAuthor={isAuthor} 
        />
      </div>
    </Layout>
  );
}