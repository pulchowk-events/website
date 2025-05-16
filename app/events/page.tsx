import EventContainer from "../components/events/EventContainer";
import PrizePoolProgress from "../components/donate/PrizePoolProgress";
import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import ClientAddEventButton from '../components/events/ClientAddEventButton';


export default async function About() {

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
    


  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center border-x dotted-border-vertical py-8 px-8">
          <h1 className="text-2xl font-bold text-white">Events</h1>
          {session && (
            <ClientAddEventButton />
          )}
        </div>
        <EventContainer />
      </div>
    </Layout>
  );
}