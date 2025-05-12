// app/donate/page.tsx
import { getDonatePageData } from '@/lib/getDonateData';
import Layout from '@/app/components/layout/Layout';
import DonateClient from '@/app/components/donate/DonateClient'; // New client component

export const dynamic = 'force-dynamic';

export default async function DonatePage() {
  const { session, donators, prizePool } = await getDonatePageData();

  return (
    <Layout>
      <DonateClient session={session} donators={donators} prizePool={prizePool} />
    </Layout>
  );
}
