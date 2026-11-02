import Layout from './components/layout/Layout';
import { TrendingUp, Users, Award } from 'lucide-react';
import LoungeClient from './lounge/LoungeClient';
import PrizePoolProgress from '@/app/components/donate/SmPrizePoolProgress';
import TopDonators from '@/app/components/donate/TopDonators';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Link from 'next/link';
import { getLoungePosts, getSidebarData } from '@/app/lib/queries';

export const revalidate = 60;

export default async function Home() {
  // All cached — no direct DB access. Both calls run in parallel.
  const [posts, { prizePool, donors, products, upcomingEvents }] = await Promise.all([
    getLoungePosts(6),
    getSidebarData(),
  ]);

  // Session-dependent — runs fresh every request (small overhead)
  const session = await getServerSession(authOptions);

  // Local aliases so the JSX below stays unchanged
  const events = upcomingEvents;
  const topDonators = donors;

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Left Sidebar */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="bg-card border border-border rounded-xl p-5 shadow-lg sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <h2 className="text-xl font-semibold text-foreground">Community</h2>
                </div>

                <div className="space-y-4">
                  <a
                    href="https://discord.gg/cQ5gxusATk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-muted/30 hover:bg-accent transition-colors p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500 rounded-lg p-2">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-foreground">Join Discord</span>
                    </div>
                    <span className="bg-muted rounded-full px-2.5 py-1 text-xs text-foreground">
                      1,050
                    </span>
                  </a>

                  <div className="pt-2">
                    <PrizePoolProgress
                      currentAmount={prizePool.currentAmount}
                      targetAmount={prizePool.targetAmount}
                      totalDonors={prizePool.totalDonors}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="w-full lg:mx-auto">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden mb-5">
                <div className="p-4 sm:p-5">
                  <LoungeClient
                    initialPosts={posts || []}
                    userId={session?.user?.id}
                  />
                </div>
              </div>

              {/* Mobile Sidebars */}
              <div className="lg:hidden space-y-4">
                <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Recent Events</h2>
                    <Link
                      href="/events"
                      className="text-green-600 dark:text-green-400 text-sm hover:underline"
                    >
                      See All
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {events && events.length > 0 ? (
                      events.map((event) => (
                        <Link
                          href={`/events/${event.id}`}
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-accent transition-colors rounded-lg"
                        >
                          <div
                            className={`bg-green-600 rounded-lg p-2 ${
                              event.category === 'software'
                                ? 'bg-blue-600'
                                : event.category === 'gaming'
                                  ? 'bg-purple-600'
                                  : event.category === 'hardware'
                                    ? 'bg-amber-600'
                                    : event.category === 'music'
                                      ? 'bg-pink-600'
                                      : event.category === 'sports'
                                        ? 'bg-emerald-600'
                                        : 'bg-green-600'
                            }`}
                          >
                            <span className="text-white text-xs font-bold">
                              {event.category.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1 text-foreground">
                              {event.title}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(event.event_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm py-2">No upcoming events</p>
                    )}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h2 className="text-lg font-semibold text-foreground">Top Donors</h2>
                    </div>
                    <Link
                      href="/donate"
                      className="text-green-600 dark:text-green-400 text-sm hover:underline"
                    >
                      Donate
                    </Link>
                  </div>

                  <div>
                    <TopDonators donators={topDonators || []} />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
                    <Link
                      href="/product-hunt"
                      className="text-green-600 dark:text-green-400 text-sm hover:underline"
                    >
                      See All
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {products && products.length > 0 ? (
                      products.map((product) => (
                        <Link
                          href={`/product-hunt/${product.url}`}
                          key={product.id}
                          className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-accent transition-colors rounded-lg"
                        >
                          <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-green-600">
                                <span className="text-white text-sm font-bold">
                                  {product.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1 text-foreground">
                              {product.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(product.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm py-2">No recent projects</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Recent Events */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Events</h2>
                    <Link
                      href="/events"
                      className="text-green-600 dark:text-green-400 text-sm hover:underline"
                    >
                      See All
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {events && events.length > 0 ? (
                      events.map((event) => (
                        <Link
                          href={`/events/${event.id}`}
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-accent transition-colors rounded-lg"
                        >
                          <div
                            className={`bg-green-600 rounded-lg px-3 py-1 ${
                              event.category === 'software'
                                ? 'bg-blue-600'
                                : event.category === 'gaming'
                                  ? 'bg-purple-600'
                                  : event.category === 'hardware'
                                    ? 'bg-amber-600'
                                    : event.category === 'music'
                                      ? 'bg-pink-600'
                                      : event.category === 'sports'
                                        ? 'bg-emerald-600'
                                        : 'bg-green-600'
                            }`}
                          >
                            <span className="text-white text-xs font-bold">
                              {event.category.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1 text-foreground">
                              {event.title}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(event.event_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm py-2">No upcoming events</p>
                    )}
                  </div>
                </div>

                {/* Top Donors */}
                <div className="bg-card border border-border rounded-xl py-4 px-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-foreground">Top Donors</h2>
                    </div>
                    <Link
                      href="/donate"
                      className="text-green-600 dark:text-green-400 text-sm hover:underline"
                    >
                      Donate
                    </Link>
                  </div>

                  <div>
                    <TopDonators donators={topDonators || []} />
                  </div>
                </div>

                {/* Recent Projects */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Recent Projects</h2>
                    <Link
                      href="/product-hunt"
                      className="text-green-600 dark:text-green-400 text-sm hover:underline"
                    >
                      See All
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {products && products.length > 0 ? (
                      products.map((product) => (
                        <Link
                          href={`/product-hunt/${product.url}`}
                          key={product.id}
                          className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-accent transition-colors rounded-lg"
                        >
                          <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-green-600">
                                <span className="text-white text-sm font-bold">
                                  {product.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1 text-foreground">
                              {product.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(product.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm py-2">No recent projects</p>
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