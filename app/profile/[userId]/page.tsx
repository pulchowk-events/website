import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import ProfileContent from '@/app/components/profile/ProfileContent';
import { SITE_URL } from '@/app/lib/seo';

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  if (!userId) return { title: 'Profile Not Found' };

  const { data: userData } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single();

  const name = userData?.name;
  const title = name ? name + "'s Profile" : 'Profile';
  const description = name
    ? 'See ' + name + "'s activity on Pulchowk Events: posts, projects, and comments."
    : 'Community profile on Pulchowk Events.';
  const url = SITE_URL + '/profile/' + userId;

  return {
    title,
    description,
    alternates: { canonical: '/profile/' + userId },
    openGraph: {
      title,
      description,
      type: 'profile',
      url,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !userData) notFound();

  const [
    { count: postsCount },
    { count: commentsCount },
    { count: productsCount },
  ] = await Promise.all([
    supabase
      .from('lounge_posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId),
    supabase
      .from('lounge_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('posted_by', userId),
  ]);

  return (
    <Layout>
      <div className="w">
        <ProfileContent
          user={userData}
          stats={{
            posts: postsCount || 0,
            comments: commentsCount || 0,
            products: productsCount || 0,
          }}
          isOwnProfile={session?.user?.id === userId}
        />
      </div>
    </Layout>
  );
}
