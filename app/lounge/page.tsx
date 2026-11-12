import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Layout from '@/app/components/layout/Layout';
import LoungeClient from './LoungeClient';
import { PageHeader } from '@/components/ui/PageHeader';
import { getLoungePosts } from '@/app/lib/queries';
import { SITE_URL } from '@/app/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Lounge — Community',
  description:
    'Community discussions, opportunities, tech help, showcases, and announcements from students across Nepal.',
  alternates: { canonical: '/lounge' },
  openGraph: {
    title: 'Lounge — Community',
    description: 'Community discussions from students across Nepal.',
    type: 'website',
    url: SITE_URL + '/lounge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lounge — Community',
    description: 'Community discussions from students across Nepal.',
  },
};

export default async function LoungePage() {
  const [session, posts] = await Promise.all([
    getServerSession(authOptions),
    getLoungePosts(6),
  ]);

  return (
    <Layout>
      <div id="portal-root" />
      <div className="w">
        <PageHeader
          eyebrow="Lounge"
          title="The community feed."
          description="Discussions, opportunities, and showcases from students across Nepal."
        />
        <LoungeClient
          initialPosts={posts}
          userId={session?.user?.id}
        />
      </div>
    </Layout>
  );
}
