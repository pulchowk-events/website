import Layout from '@/app/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import ProductHuntClient from './ProductHuntClient';
import SmPrizePoolProgress from '@/app/components/donate/SmPrizePoolProgress';
import TopDonators from '@/app/components/donate/TopDonators';
import Link from 'next/link';
import { getApprovedProducts, getSidebarData } from '@/app/lib/queries';

export const revalidate = 60;

export default async function ProductHuntPage() {
  const [products, { prizePool, donors, upcomingEvents }] = await Promise.all([
    getApprovedProducts(),
    getSidebarData(),
  ]);

  const session = await getServerSession(authOptions);

  return (
    <Layout>
      <div id="portal-root"></div>
      <div className="bg-background min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Left Sidebar */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="bg-card border border-border rounded-xl p-5 shadow-lg sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Products</h2>
                </div>
                <div className="space-y-4">
                  <div className="pt-2">
                    <SmPrizePoolProgress
                      currentAmount={prizePool.currentAmount}
                      targetAmount={prizePool.targetAmount}
                      totalDonors={prizePool.totalDonors}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="w-full lg:mx-auto">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden mb-5">
                <div className="p-4 sm:p-5">
                  <div className="lg:hidden flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Products</h2>
                  </div>
                  <ProductHuntClient
                    products={products || []}
                    userId={session?.user?.id}
                  />
                </div>
              </div>

              {/* Mobile sidebars */}
              <div className="lg:hidden space-y-4">
                <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Top Donors</h2>
                    <Link
                      href="/donate"
                      className="text-green-600 dark:text-green-400 text-sm hover:underline"
                    >
                      Donate
                    </Link>
                  </div>
                  <TopDonators donators={donors} />
                </div>

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
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-accent transition-colors rounded-lg"
                        >
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
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
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
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-accent transition-colors rounded-lg"
                        >
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

                <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Top Donors</h2>
                    <Link
                      href="/donate"
                      className="text-green-600 dark:text-green-400 text-sm hover:underline"
                    >
                      Donate
                    </Link>
                  </div>
                  <TopDonators donators={donors} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}