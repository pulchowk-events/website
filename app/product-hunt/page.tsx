import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import ProductHuntClient from './ProductHuntClient';
import PrizePoolProgress from '@/app/components/donate/PrizePoolProgress';
import TopDonators from '@/app/components/donate/TopDonators';

export const dynamic = 'force-dynamic';

export default async function ProductHuntPage() {
  const session = await getServerSession(authOptions);
  
  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  // Get target amount from prize_pool
  const { data: prizePool } = await supabase
    .from('prize_pool')
    .select('target_amount')
    .single();

  // Calculate current amount from verified donations
  const { data: verifiedDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('verified', true);

  // Sum up verified donations for current amount
  const current_amount = verifiedDonations?.reduce(
    (sum, donation) => sum + donation.amount,
    0
  ) || 0;

  // Get total verified donors count
  const { count: total_donors } = await supabase
    .from('donations')
    .select('*', { count: 'exact' })
    .eq('verified', true);

  // Fetch top donators
  const { data: topDonators } = await supabase
    .from('donations')
    .select('id, name, amount, avatar_url')
    .eq('show_on_leaderboard', true)
    .eq('verified', true)
    .order('amount', { ascending: false })
    .limit(5);
  
  return (
    <Layout>
      <div id="portal-root "></div>
      <div className='max-w-7xl mx-auto dotted-border-vertical border-x'>
      {/* Prize Pool Section */}
      <div className="pt-8 border-b dotted-border-horizontal px-8">
        <PrizePoolProgress 
          currentAmount={current_amount}
          targetAmount={prizePool?.target_amount || 100000}
          totalDonors={total_donors || 0}
        />
      </div>
      
      <div className=" px-8 py-8 min-h-200 flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <ProductHuntClient 
            products={products || []} 
            userId={session?.user?.id} 
          />
        </div>
        
        {/* Sidebar */}
        <div className="w-80 hidden lg:block">
          <TopDonators donators={topDonators || []} />
        </div>
      </div>
      </div>
    </Layout>
  );
}