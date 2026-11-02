import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Layout from '@/app/components/layout/Layout';
import LoungeClient from './LoungeClient';
import { getLoungePosts } from '@/app/lib/queries';

export const revalidate = 60;

import type { Metadata } from 'next';
import { SITE_URL } from '@/app/lib/seo';

export const metadata: Metadata = {
  title: 'Lounge — Community',
  description:
    'Community discussions, opportunities, tech help, showcases, and announcements from students across Nepal.',
  alternates: { canonical: '/lounge' },
  openGraph: {
    title: 'Lounge — Community',
    description: 'Community discussions from students across Nepal.',
    type: 'website',
    url: `${SITE_URL}/lounge`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lounge — Community',
    description: 'Community discussions from students across Nepal.',
  },
};

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