import Layout from '@/app/components/layout/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Users, Award, Star, MessageCircle, CalendarCheck, ClipboardList, Network, Shield, User, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import PrizePoolProgress from '@/app/components/donate/SmPrizePoolProgress';
import TopDonators from '@/app/components/donate/TopDonators';

export const revalidate = 0;

export default async function AboutPage() {
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
  
  // Fetch recent products
  const { data: products } = await supabase
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
            
            {/* Main Content Area */}
            <div className="w-full lg:mx-auto">
              {/* About Hero Section */}
              <div className="bg-white/5 rounded-xl p-6 shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 blur-3xl bg-purple-500/20 rounded-full -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 blur-3xl bg-green-500/10 rounded-full translate-y-1/3 -translate-x-1/4"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600 p-2.5 rounded-lg">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome to Pulchowk Events</h1>
                  </div>
                  <p className="mt-4 text-gray-300 text-lg leading-relaxed">
                    Your dynamic portal to campus happenings, where news, events, and opportunities 
                    converge to enrich your academic journey.
                  </p>
                </div>
              </div>
              
              {/* About Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {/* Discover Us */}
                <div className="bg-white/5 rounded-xl p-5 shadow-lg hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Discover Us</h2>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Welcome to the vibrant community of Pulchowk Events! We're your dynamic portal to campus happenings, 
                    where news, events, and opportunities converge to enrich your academic journey.
                  </p>
                </div>
                
                {/* Inclusive Gatherings */}
                <div className="bg-white/5 rounded-xl p-5 shadow-lg hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <CalendarCheck className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Inclusive Gatherings</h2>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Our events come in two flavors: <span className="text-green-400 font-medium">Open</span> (accessible to all, pinged) 
                    and <span className="text-purple-400 font-medium">Exclusive</span> (tailored for Pulchowk students, non pinged), 
                    ensuring a diverse and inclusive experience for every attendee.
                  </p>
                </div>
                
                {/* Club Enrollment */}
                <div className="bg-white/5 rounded-xl p-5 shadow-lg hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-amber-600 p-2 rounded-lg">
                      <ClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Club Enrollment</h2>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-3">
                    Calling all IOE clubs! Enroll your club via our Google Form to share updates and actively 
                    contribute to our lively platform.
                  </p>
                  <a 
                    href="https://forms.gle/gjburXWczani9S6y7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-amber-600/30 hover:bg-amber-600/50 transition-colors py-2 px-4 rounded-lg text-amber-200"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Apply Now</span>
                  </a>
                </div>
                
                {/* Join Our Network */}
                <div className="bg-white/5 rounded-xl p-5 shadow-lg hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-pink-600 p-2 rounded-lg">
                      <Network className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Join Our Network</h2>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Got a Discord server for your club? Connect with us through our Google Form to seamlessly 
                    integrate your announcements and engage with our community.
                  </p>
                </div>
              </div>
              
              {/* More Information Section */}
              <div className="bg-white/5 rounded-xl p-5 shadow-lg mb-6">
                <h2 className="text-2xl font-bold text-white mb-5">More About Us</h2>
                
                <div className="space-y-6">
                  {/* Demystifying Myths */}
                  <div className="flex gap-4">
                    <div className="bg-indigo-600/30 p-2 rounded-lg h-min">
                      <Shield className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Demystifying Myths</h3>
                      <p className="text-gray-300 leading-relaxed">
                        We're debunking the misconception that clubs and workshops are reserved solely for 
                        Pulchowk students. Everyone is encouraged to participate and collaborate with us.
                      </p>
                    </div>
                  </div>
                  
                  {/* For Students, By Students */}
                  <div className="flex gap-4">
                    <div className="bg-green-600/30 p-2 rounded-lg h-min">
                      <User className="w-5 h-5 text-green-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">For Students, By Students</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Pulchowk Events is a student-driven initiative, fostering an environment of 
                        peer-to-peer knowledge exchange and opportunity exploration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Connect With Us Section */}
              <div className="bg-gradient-to-br from-purple-900/40 to-green-900/40 rounded-xl p-6 shadow-lg mb-6">
                <h2 className="text-2xl font-bold text-white mb-5">Connect With Us</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Discord Link */}
                  <a 
                    href="https://discord.gg/cQ5gxusATk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-600/30 hover:bg-indigo-600/50 transition-colors p-4 rounded-xl flex items-center gap-3"
                  >
                    <div className="bg-indigo-600 p-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
                        <path d="M7.5 7.2C8.7 6.47 10.2 6 12 6c1.8 0 3.3.47 4.5 1.2"/>
                        <path d="M7.5 16.8C8.7 17.53 10.2 18 12 18c1.8 0 3.3-.47 4.5-1.2"/>
                        <path d="M15.5 17 17 20l2-3 1.5.5-1-2.5"/>
                        <path d="M8.5 17 7 20l-2-3-1.5.5 1-2.5"/>
                        <path d="M20 2a4.18 4.18 0 0 1-4 4 4.18 4.18 0 0 1-4-4 4.18 4.18 0 0 1 4-4 4.18 4.18 0 0 1 4 4Z"/>
                        <path d="M18 6v12a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V6"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">Join Our Discord</p>
                      <p className="text-indigo-200 text-sm">discord.gg/cQ5gxusATk</p>
                    </div>
                    <ExternalLink className="ml-auto w-5 h-5 text-indigo-200" />
                  </a>
                  
                  {/* Shortened Link */}
                  <a 
                    href="https://bit.ly/PULCHOWK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600/30 hover:bg-green-600/50 transition-colors p-4 rounded-xl flex items-center gap-3"
                  >
                    <div className="bg-green-600 p-2 rounded-lg">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Shortened Link</p>
                      <p className="text-green-200 text-sm">bit.ly/PULCHOWK</p>
                    </div>
                    <ExternalLink className="ml-auto w-5 h-5 text-green-200" />
                  </a>
                </div>
                
                {/* Access Channel Info */}
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-purple-300" />
                    <h3 className="text-lg font-semibold text-white">Access Channel</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Visit the <span className="bg-gray-700/50 px-1.5 py-0.5 rounded text-gray-200">#access-channel</span> for 
                    event notifications and channel permissions.
                  </p>
                  
                  <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-3">
                    <div className="bg-yellow-500 p-1 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-900">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <path d="M12 9v4"/>
                        <path d="M12 17h.01"/>
                      </svg>
                    </div>
                    <p className="text-yellow-200 text-sm">
                      <strong>Bonus tip:</strong> Follow event channels and get updates for upcoming events directly into your server!
                    </p>
                  </div>
                </div>
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
                    {events && events.length > 0 ? (
                      events.map(event => (
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
                    {products && products.length > 0 ? (
                      products.map(product => (
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
                    {events && events.length > 0 ? (
                      events.map(event => (
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
                    {products && products.length > 0 ? (
                      products.map(product => (
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