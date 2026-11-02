import { supabase } from '@/app/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Layout from '@/app/components/layout/Layout';
import EventsClient from '@/app/components/events/EventsClient';
import ClientAddEventButton from '../components/events/ClientAddEventButton';
import PrizePoolProgress from '../components/donate/SmPrizePoolProgress';
import TopDonators from '@/app/components/donate/TopDonators';
import Link from 'next/link';

// ISR: cache each unique URL for 60s. Cold render still happens (first hit),
// but subsequent views (including Google's repeated crawls) hit cache.
export const revalidate = 60;

const PAGE_SIZE = 24;
const VALID_CATEGORIES = ['all', 'software', 'gaming', 'hardware', 'music', 'sports', 'extra'];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;

  const tab: 'upcoming' | 'past' = params.tab === 'past' ? 'past' : 'upcoming';
  const category = VALID_CATEGORIES.includes(params.category || '') ? (params.category as string) : 'all';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const session = await getServerSession(authOptions);
  const nowISO = new Date().toISOString();

  // Main query: verified events only, paginated, filtered server-side
  let eventsQuery = supabase
    .from('events')
    .select(
      `
      *,
      author:created_by (
        id,
        name,
        image
      )
    `,
      { count: 'exact' }
    )
    .eq('verified', true);

  if (tab === 'upcoming') {
    eventsQuery = eventsQuery
      .gte('event_date', nowISO)
      .order('event_date', { ascending: true });
  } else {
    eventsQuery = eventsQuery
      .lt('event_date', nowISO)
      .order('event_date', { ascending: false });
  }

  if (category !== 'all') {
    eventsQuery = eventsQuery.eq('category', category);
  }

  eventsQuery = eventsQuery.range(offset, offset + PAGE_SIZE - 1);

  // All sidebars can run in parallel
  const [
    { data: events, count: totalCount },
    { data: prizePool },
    { data: verifiedDonations },
    { count: total_donors },
    { data: topDonators },
    { data: products },
  ] = await Promise.all([
    eventsQuery,
    supabase.from('prize_pool').select('target_amount').single(),
    supabase.from('donations').select('amount').eq('verified', true),
    supabase.from('donations').select('*', { count: 'exact' }).eq('verified', true),
    supabase
      .from('donations')
      .select('id, name, amount, avatar_url')
      .eq('show_on_leaderboard', true)
      .eq('verified', true)
      .order('amount', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('id, name, image_url, created_at, url')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const current_amount =
    verifiedDonations?.reduce((sum, d) => sum + d.amount, 0) || 0;

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

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Left Sidebar */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="bg-card border border-border rounded-xl p-5 shadow-lg sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Events</h2>
                  {session && <ClientAddEventButton />}
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

            {/* Main Content */}
            <div className="w-full lg:mx-auto">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden mb-5">
                <div className="p-4 sm:p-5">
                  <div className="lg:hidden flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Events</h2>
                    {session && <ClientAddEventButton />}
                  </div>

                  <EventsClient
                    events={events || []}
                    totalCount={totalCount || 0}
                    page={page}
                    pageSize={PAGE_SIZE}
                    tab={tab}
                    category={category}
                    isAdmin={isAdmin}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
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

                <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}