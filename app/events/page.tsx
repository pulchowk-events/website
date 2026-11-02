import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Layout from '@/app/components/layout/Layout';
import EventsClient from '@/app/components/events/EventsClient';
import ClientAddEventButton from '../components/events/ClientAddEventButton';
import PrizePoolProgress from '../components/donate/SmPrizePoolProgress';
import TopDonators from '@/app/components/donate/TopDonators';
import Link from 'next/link';
import { getEventsPage, getSidebarData } from '@/app/lib/queries';
import { SITE_URL } from '@/app/lib/seo';

export const revalidate = 60;

const PAGE_SIZE = 24;
const VALID_CATEGORIES = ['all', 'software', 'gaming', 'hardware', 'music', 'sports', 'extra'];

interface SearchParams {
  tab?: string;
  category?: string;
  page?: string;
}

function parseParams(params: SearchParams) {
  const tab: 'upcoming' | 'past' = params.tab === 'past' ? 'past' : 'upcoming';
  const category = VALID_CATEGORIES.includes(params.category || '')
    ? (params.category as string)
    : 'all';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  return { tab, category, page };
}

function buildCanonical(tab: 'upcoming' | 'past', category: string, page: number) {
  const qs = new URLSearchParams();
  if (tab === 'past') qs.set('tab', 'past');
  if (category !== 'all') qs.set('category', category);
  if (page > 1) qs.set('page', String(page));
  const q = qs.toString();
  return q ? `/events?${q}` : '/events';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const { tab, category, page } = parseParams(params);

  const categoryLabel =
    category !== 'all' ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  const parts: string[] = [];
  if (categoryLabel) parts.push(categoryLabel);
  parts.push(tab === 'past' ? 'Past Events' : 'Upcoming Events');
  if (page > 1) parts.push(`Page ${page}`);

  const title = parts.join(' — ');
  const description =
    tab === 'past'
      ? `Past ${categoryLabel.toLowerCase() ? categoryLabel.toLowerCase() + ' ' : ''}campus events across Nepal — browse the archive.`
      : `Browse upcoming ${categoryLabel.toLowerCase() ? categoryLabel.toLowerCase() + ' ' : ''}events across Nepal. Register for hackathons, workshops, and more.`;

  return {
    title,
    description,
    alternates: { canonical: buildCanonical(tab, category, page) },
    openGraph: {
      title,
      description,
      type: 'website',
      url: buildCanonical(tab, category, page),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { tab, category, page } = parseParams(params);

  const [{ events, totalCount }, { prizePool, donors, products }] = await Promise.all([
    getEventsPage(tab, category, page, PAGE_SIZE),
    getSidebarData(),
  ]);

  const session = await getServerSession(authOptions);
  let isAdmin = false;
  if (session?.user?.email) {
    try {
      const response = await fetch(
        `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`,
        { cache: 'no-store' }
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
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="bg-card border border-border rounded-xl p-5 shadow-lg sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Events</h2>
                  {session && <ClientAddEventButton />}
                </div>
                <div className="space-y-4">
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

            <div className="w-full lg:mx-auto">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden mb-5">
                <div className="p-4 sm:p-5">
                  <div className="lg:hidden flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Events</h2>
                    {session && <ClientAddEventButton />}
                  </div>
                  <EventsClient
                    events={events}
                    totalCount={totalCount}
                    page={page}
                    pageSize={PAGE_SIZE}
                    tab={tab}
                    category={category}
                    isAdmin={isAdmin}
                  />
                </div>
              </div>
            </div>

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
                    {products.length > 0 ? (
                      products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product-hunt/${product.url}`}
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