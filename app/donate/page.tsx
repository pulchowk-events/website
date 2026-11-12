import type { Metadata } from 'next';
import Layout from '@/app/components/layout/Layout';
import DonateClient from '@/app/components/donate/DonateClient';
import { getTopDonators, getPrizePool } from '@/app/lib/queries';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { SITE_URL } from '@/app/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Support Future Innovators',
  description:
    'Fund student investing competitions and seed capital for student projects across Nepal. 100% of donations go directly to students.',
  alternates: { canonical: '/donate' },
  openGraph: {
    title: 'Support Future Innovators — Pulchowk Events',
    description:
      'Fund student investing competitions and seed capital for student projects across Nepal.',
    type: 'website',
    url: SITE_URL + '/donate',
    images: [SITE_URL + '/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support Future Innovators — Pulchowk Events',
    description:
      'Fund student investing competitions and seed capital for student projects across Nepal.',
    images: [SITE_URL + '/opengraph-image'],
  },
};

export default async function DonatePage() {
  const [donators, prizePoolData, session] = await Promise.all([
    getTopDonators(5),
    getPrizePool(),
    getServerSession(authOptions),
  ]);

  const prizePool = {
    current_amount: prizePoolData.currentAmount,
    target_amount: prizePoolData.targetAmount,
  };

  return (
    <Layout>
      <DonateClient session={session} donators={donators} prizePool={prizePool} />
    </Layout>
  );
}
