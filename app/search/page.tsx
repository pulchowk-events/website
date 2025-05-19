import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Box, MessageSquare, Clock, TrendingUp, Users, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PrizePoolProgress from '@/app/components/donate/SmPrizePoolProgress';
import TopDonators from '@/app/components/donate/TopDonators';

export const revalidate = 0;

interface SearchResult {
  type: 'post' | 'event' | 'product';
  id: string;
  title: string | null;
  description?: string | null;
  created_at: string;
  url?: string;
  image_url?: string | null;
  users?: {
    name: string;
    image: string;
  } | null;
  event_date?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const query = searchParams.q;

  // Search posts with full text search
  const { data: posts } = await supabase
    .from('lounge_posts')
    .select(`
      id,
      title,
      content,
      created_at,
      users:author_id (
        name,
        image
      )
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(5);

  // Search events with full text search
  const { data: events } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      event_date,
      created_at,
      category,
      image_url,
      users:created_by (
        name,
        image
      )
    `)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('verified', true)
    .order('event_date', { ascending: true })
    .limit(5);

  // Search products with full text search
  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      url,
      image_url,
      created_at,
      users:posted_by (
        name,
        image
      )
    `)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get upcoming events for sidebar
  const { data: upcomingEvents } = await supabase
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

  // Get prize pool information
  const { data: prizePool } = await supabase
    .from('prize_pool')
    .select('target_amount')
    .single();

  // Calculate current amount from verified donations
  const { data: verifiedDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('verified', true);

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

  // Fetch recent products for sidebar
  const { data: recentProducts } = await supabase
    .from('products')
    .select('id, name, image_url, created_at, url')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <Layout>
      <div className="bg-black min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Left Sidebar - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="bg-white/5 rounded-xl p-5 shadow-lg sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                  <h2 className="text-xl font-semibold text-white">Community</h2>
                </div>
                
                <div className="space-y-4">
                  <a 
                    href="https://discord.gg/cQ5gxusATk" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500 rounded-lg p-2">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">Join Discord</span>
                    </div>
                    <span className="bg-white/10 rounded-full px-2.5 py-1 text-xs">1,050</span>
                  </a>
                  
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
            
            {/* Main Content Area (Search Results) */}
            <div className="w-full lg:mx-auto">
              <div className="bg-white/5 rounded-xl shadow-lg overflow-hidden mb-5 p-5">
                <h1 className="text-2xl font-bold text-white mb-6">
                  Search results for "{query || ''}"
                </h1>

                {!query && (
                  <p className="text-gray-400 text-center py-8">Enter a search term to begin</p>
                )}

                {query && (
                  <div className="space-y-8">
                    {/* Posts Section */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-green-500" />
                        <h2 className="text-xl font-semibold text-white">Lounge Posts</h2>
                      </div>
                      <div className="space-y-4">
                        {posts?.length ? (
                          posts.map((post) => (
                            <Link
                              key={post.id}
                              href={`/lounge?postId=${post.id}`}
                              className="block bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                  <Image
                                    src={post.users?.image || '/default-avatar.png'}
                                    alt={post.users?.name || 'User'}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium text-white">{post.title}</h3>
                                  <p className="text-sm text-gray-400 mt-1">
                                    by {post.users?.name} •{' '}
                                    {formatDistanceToNow(new Date(post.created_at), {
                                      addSuffix: true,
                                    })}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <p className="text-gray-400">No posts found</p>
                        )}
                        {posts?.length ? (
                          <Link
                            href={`/lounge?search=${query}`}
                            className="inline-block text-green-500 hover:text-green-400 text-sm mt-2"
                          >
                            View all posts →
                          </Link>
                        ) : null}
                      </div>
                    </section>

                    {/* Events Section */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <h2 className="text-xl font-semibold text-white">Events</h2>
                      </div>
                      <div className="space-y-4">
                        {events?.length ? (
                          events.map((event) => (
                            <Link
                              key={event.id}
                              href={`/events#${event.id}`}
                              className="block bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-colors"
                            >
                              <div className="flex">
                                <div className="w-24 h-24 relative flex-shrink-0">
                                  <Image
                                    src={event.image_url || '/event-placeholder.jpg'}
                                    alt={event.title || ''}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="p-4">
                                  <h3 className="font-medium text-white">{event.title}</h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                    <Clock className="w-4 h-4" />
                                    <time>
                                      {new Date(event.event_date).toLocaleDateString()}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <p className="text-gray-400">No events found</p>
                        )}
                      </div>
                    </section>

                    {/* Products Section */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Box className="w-5 h-5 text-green-500" />
                        <h2 className="text-xl font-semibold text-white">Projects</h2>
                      </div>
                      <div className="space-y-4">
                        {products?.length ? (
                          products.map((product) => (
                            <Link
                              key={product.id}
                              href={`/product-hunt/${product.url}`}
                              className="block bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-colors"
                            >
                              <div className="flex">
                                <div className="w-24 h-24 relative flex-shrink-0">
                                  <Image
                                    src={product.image_url || '/product-placeholder.jpg'}
                                    alt={product.name || ''}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="p-4">
                                  <h3 className="font-medium text-white">{product.name}</h3>
                                  <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                                    {product.description}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <p className="text-gray-400">No projects found</p>
                        )}
                      </div>
                    </section>
                  </div>
                )}
              </div>

              {/* Mobile View Sidebars */}
              <div className="lg:hidden space-y-4">
                {/* Mobile: Recent Events */}
                <div className="bg-white/5 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Recent Events</h2>
                    <Link href="/events" className="text-green-400 text-sm hover:underline">See All</Link>
                  </div>
                  
                  <div className="space-y-3">
                    {upcomingEvents && upcomingEvents.length > 0 ? (
                      upcomingEvents.map(event => (
                        <Link 
                          href={`/events`} 
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg"
                        >
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
                
                {/* Mobile: Top Donors */}
                <div className="bg-white/5 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-400" />
                      <h2 className="text-lg font-semibold text-white">Top Donors</h2>
                    </div>
                    <Link href="/donate" className="text-green-400 text-sm hover:underline">Donate</Link>
                  </div>
                  
                  <div>
                    <TopDonators donators={topDonators || []} />
                  </div>
                </div>
                
                {/* Mobile: Recent Products */}
                <div className="bg-white/5 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
                    <Link href="/product-hunt" className="text-green-400 text-sm hover:underline">See All</Link>
                  </div>
                  
                  <div className="space-y-3">
                    {recentProducts && recentProducts.length > 0 ? (
                      recentProducts.map(product => (
                        <Link 
                          href={`/product-hunt/${product.url}`} 
                          key={product.id}
                          className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg"
                        >
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
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm py-2">No recent projects</p>
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
                    {upcomingEvents && upcomingEvents.length > 0 ? (
                      upcomingEvents.map(event => (
                        <Link 
                          href={`/events`} 
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg"
                        >
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
                <div className="bg-white/5 rounded-xl py-4 px-6 justify-center shadow-lg">
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
                
                {/* Recent Products */}
                <div className="bg-white/5 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
                    <Link href="/product-hunt" className="text-green-400 text-sm hover:underline">See All</Link>
                  </div>
                  
                  <div className="space-y-3">
                    {recentProducts && recentProducts.length > 0 ? (
                      recentProducts.map(product => (
                        <Link 
                          href={`/product-hunt/${product.url}`} 
                          key={product.id}
                          className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg"
                        >
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
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm py-2">No recent projects</p>
                    )}
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