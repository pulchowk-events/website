import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import ProfileContent from '@/app/components/profile/ProfileContent'
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: { userId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const userId = params?.userId;

  if (!userId) {
    return {
      title: 'Profile Not Found | Pulchowk Events'
    };
  }

  const { data: userData } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single();

  return {
    title: userData?.name ? `${userData.name}'s Profile | Pulchowk Events` : 'Profile | Pulchowk Events'
  };
}

export default async function ProfilePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  
  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.userId)
    .single();

  if (userError || !userData) {
    redirect('/');
  }

  // Fetch user stats
  const [
    { count: postsCount },
    { count: commentsCount },
    { count: productsCount }
  ] = await Promise.all([
    supabase
      .from('lounge_posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', params.userId),
    supabase
      .from('lounge_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', params.userId),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('posted_by', params.userId)
  ]);

  return (
    <Layout>
      <div id="portal-root"></div>
      <div className="max-w-7xl mx-auto min-h-200 px-4 sm:px-6 lg:px-8 py-8">
        <ProfileContent 
          user={userData}
          stats={{
            posts: postsCount || 0,
            comments: commentsCount || 0,
            products: productsCount || 0
          }}
          isOwnProfile={session?.user?.id === params.userId}
        />
      </div>
    </Layout>
  );
}