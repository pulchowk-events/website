import { supabase } from '@/app/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Layout from '@/app/components/layout/Layout';
import EventsClient from '@/app/components/events/EventsClient';
import ClientAddEventButton from '../components/events/ClientAddEventButton';
import PrizePoolProgress from "../components/donate/SmPrizePoolProgress";
import TopDonators from '@/app/components/donate/TopDonators';
import Link from 'next/link'

export default async function Events() {
  const session = await getServerSession(authOptions);
  
  // Get verified events only
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      author:created_by (
        id,
        name,
        image
      )
    `)
    .eq('verified', true)
    .order('event_date', { ascending: true });

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

  // Get top donators
  const { data: topDonators } = await supabase
    .from('donations')
    .select('id, name, amount, avatar_url')
    .eq('show_on_leaderboard', true)
    .eq('verified', true)
    .order('amount', { ascending: false })
    .limit(5);

  // Fetch recent products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, image_url, created_at, url')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(3);

  let isAdmin = false;

  if (session?.user?.email) {
    try {
      const response = await fetch(
        `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${session.user.email}`
      );
      const { isAdmin: adminStatus } = await response.json();
      isAdmin = adminStatus;
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }

  const now = new Date();
  const upcomingEvents = events?.filter(event => new Date(event.event_date) >= now) || [];
  const pastEvents = events?.filter(event => new Date(event.event_date) < now) || [];

  return (
    <Layout>
      <div className="bg-black min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Left Sidebar - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="bg-white/5 rounded-xl p-5 shadow-lg sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-semibold text-white">Events</h2>
                  {session && (
                    <ClientAddEventButton />
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="pt-2">
                    <PrizePoolProgress 
                      currentAmount={current_amount}
                      targetAmount={prizePool?.target_amount || 100000}
                      totalDonors={total_donors || 0}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content Area (Events) */}
            <div className="w-full lg:mx-auto">
              <div className="bg-white/5 rounded-xl shadow-lg overflow-hidden mb-5">
                <div className="p-4 sm:p-5">
                  <div className="lg:hidden flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Events</h2>
                    {session && (
                      <ClientAddEventButton />
                    )}
                  </div>
                  
                  <EventsClient
                    upcomingEvents={upcomingEvents}
                    pastEvents={pastEvents}
                    isAdmin={isAdmin}
                  />
                </div>
              </div>
            </div>
            
            {/* Right Sidebar - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Recent Projects */}
                <div className="bg-white/5 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
                    <a href="/product-hunt" className="text-green-400 text-sm hover:underline">See All</a>
                  </div>
                  
                  <div className="space-y-3">
                    {products && products.length > 0 ? (
                      products.map(product => (
                        <a 
                          href={`/product-hunt/${product.url}`} 
                          key={product.id}
                          className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg">
                          <div className="w-10 h-10 bg-white/10 rounded-lg overflow-hidden">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-green-600">
                                <span className="text-white text-sm font-bold">{product.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                            <p className="text-gray-400 text-xs">
                              {new Date(product.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </a>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm py-2">No recent projects</p>
                    )}
                  </div>
                </div>
                
                {/* Top Donors */}
                
                {/* Top Donors */}
                <div className="bg-white/5 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-white">Top Donors</h2>
                    </div>
                    <Link href="/donate" className="text-green-400 text-sm hover:underline">Donate</Link>
                  </div>
                  
                  <div>
                    <TopDonators donators={topDonators || []} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}