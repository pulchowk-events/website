import Layout from '@/app/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import ProductHuntClient from './ProductHuntClient';
import { PageHeader } from '@/components/ui/PageHeader';
import { getApprovedProducts } from '@/app/lib/queries';
import { SITE_URL } from '@/app/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Product Hunt — Student Projects',
  description:
    'Discover and vote on student-built projects, tools, and experiments from across Nepal. Showcase your own product on Pulchowk Events.',
  alternates: { canonical: '/product-hunt' },
  openGraph: {
    title: 'Product Hunt — Student Projects',
    description: 'Discover and vote on student-built projects from Nepal.',
    type: 'website',
    url: SITE_URL + '/product-hunt',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Product Hunt — Student Projects',
    description: 'Discover and vote on student-built projects from Nepal.',
  },
};

export default async function ProductHuntPage() {
  const [products, session] = await Promise.all([
    getApprovedProducts(),
    getServerSession(authOptions),
  ]);

  return (
    <Layout>
      <div id="portal-root" />
      <div className="w">
        <PageHeader
          eyebrow="Product Hunt"
          title="Student-built projects."
          description="Vote on what your peers shipped. Ranked by community support, updated in real time."
        />
        <ProductHuntClient
          products={products || []}
          userId={session?.user?.id}
        />
      </div>
    </Layout>
  );
}
