import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Layout from '@/app/components/layout/Layout';
import LoungeClient from './LoungeClient';
import { getLoungePosts } from '@/app/lib/queries';

export const revalidate = 60;

export default async function LoungePage() {
  const session = await getServerSession(authOptions);
  const posts = await getLoungePosts(6);

  return (
    <Layout>
      <div id="portal-root"></div>
      <div className="max-w-7xl mx-auto">
        <div className="px-8 py-8 min-h-200">
          <LoungeClient
            initialPosts={posts}
            userId={session?.user?.id}
          />
        </div>
      </div>
    </Layout>
  );
}