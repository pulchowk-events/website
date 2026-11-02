import Layout from '@/app/components/layout/Layout';
import DonateClient from '@/app/components/donate/DonateClient';
import { getTopDonators, getPrizePool } from '@/app/lib/queries';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export const revalidate = 60;

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