import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export async function getDonatePageData() {
  const session = await getServerSession(authOptions);

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

  // Sum up verified donations
  const current_amount = verifiedDonations?.reduce(
    (sum, donation) => sum + donation.amount,
    0
  ) || 0;

  // Get verified donors count
  const { count: totalDonors } = await supabase
    .from('donations')
    .select('*', { count: 'exact' })
    .eq('verified', true);

  // Fetch top donators
  const { data: donators } = await supabase
    .from('donations')
    .select('id, name, amount, avatar_url')
    .eq('show_on_leaderboard', true)
    .eq('verified', true)
    .order('amount', { ascending: false })
    .limit(5);

  return {
    session,
    donators: donators || [],
    prizePool: {
      current_amount,
      target_amount: prizePool?.target_amount || 100000,
      total_donors: totalDonors || 0
    }
  };
}