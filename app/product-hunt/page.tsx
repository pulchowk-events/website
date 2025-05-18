import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import ProductHuntClient from './ProductHuntClient';
import SmPrizePoolProgress from '@/app/components/donate/SmPrizePoolProgress';
import TopDonators from '@/app/components/donate/TopDonators';
import Link from 'next/link';
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
  
  // Fetch upcoming events for sidebar
  const { data: events } = await supabase
    .from('events')
    .select(`
      id,
      title,
      event_date,
      category,
      author:created_by (
        name,
        image
      )
    `)
    .eq('verified', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3);
  
  return (
    <Layout>
      <div id="portal-root"></div>
      <div className="bg-black min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Left Sidebar - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="bg-white/5 rounded-xl p-5 shadow-lg sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-semibold text-white">Products</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="pt-2">
                    <SmPrizePoolProgress 
                      currentAmount={current_amount}
                      targetAmount={prizePool?.target_amount || 100000}
                      totalDonors={total_donors || 0}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content Area (Products) */}
            <div className="w-full lg:mx-auto">
              <div className="bg-white/5 rounded-xl shadow-lg overflow-hidden mb-5">
                <div className="p-4 sm:p-5">
                  <div className="lg:hidden flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Products</h2>
                  </div>
                  
                  <ProductHuntClient 
                    products={products || []} 
                    userId={session?.user?.id} 
                  />
                </div>
              </div>
              
              {/* Mobile View: Top Donors */}
              <div className="lg:hidden space-y-4">
                <div className="bg-white/5 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Top Donors</h2>
                    <Link href="/donate" className="text-green-400 text-sm hover:underline">Donate</Link>
                  </div>
                  
                  <div>
                    <TopDonators donators={topDonators || []} />
                  </div>
                </div>
                
                {/* Mobile View: Recent Events */}
                <div className="bg-white/5 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Recent Events</h2>
                    <Link href="/events" className="text-green-400 text-sm hover:underline">See All</Link>
                  </div>
                  
                  <div className="space-y-3">
                    {events && events.length > 0 ? (
                      events.map(event => (
                        <Link 
                          href={`/events/${event.id}`} 
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg">
                          <div className={`bg-green-600 rounded-lg p-2 ${
                            event.category === 'software' ? 'bg-blue-600' :
                            event.category === 'gaming' ? 'bg-purple-600' :
                            event.category === 'hardware' ? 'bg-amber-600' :
                            event.category === 'music' ? 'bg-pink-600' :
                            event.category === 'sports' ? 'bg-emerald-600' : 'bg-green-600'
                          }`}>
                            <span className="text-white text-xs font-bold">{event.category.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">{event.title}</p>
                            <p className="text-gray-400 text-xs">
                              {new Date(event.event_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm py-2">No upcoming events</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Sidebar - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Recent Events */}
                <div className="bg-white/5 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Events</h2>
                    <Link href="/events" className="text-green-400 text-sm hover:underline">See All</Link>
                  </div>
                  
                  <div className="space-y-3">
                    {events && events.length > 0 ? (
                      events.map(event => (
                        <Link 
                          href={`/events/${event.id}`} 
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg">
                          <div className={`bg-green-600 rounded-lg px-3 py-1 ${
                            event.category === 'software' ? 'bg-blue-600' :
                            event.category === 'gaming' ? 'bg-purple-600' :
                            event.category === 'hardware' ? 'bg-amber-600' :
                            event.category === 'music' ? 'bg-pink-600' :
                            event.category === 'sports' ? 'bg-emerald-600' : 'bg-green-600'
                          }`}>
                            <span className="text-white text-xs font-bold">{event.category.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">{event.title}</p>
                            <p className="text-gray-400 text-xs">
                              {new Date(event.event_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm py-2">No upcoming events</p>
                    )}
                  </div>
                </div>
                
                {/* Top Donors */}
                <div className="bg-white/5 rounded-xl py-4 px-6 shadow-lg">
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