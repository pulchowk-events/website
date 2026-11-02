import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Layout from '@/app/components/layout/Layout';
import LeftSidebar from '@/app/components/layout/LeftSidebar';
import RightSidebar from '@/app/components/layout/RightSidebar';
import EventsClient from '@/app/components/events/EventsClient';
import ClientAddEventButton from '../components/events/ClientAddEventButton';
import { getEventsPage } from '@/app/lib/queries';

export const revalidate = 60;

const PAGE_SIZE = 24;
const VALID_CATEGORIES = ['all', 'software', 'gaming', 'hardware', 'music', 'sports', 'extra'];

interface SearchParams { tab?: string; category?: string; page?: string }

function parseParams(params: SearchParams) {
  const tab: 'upcoming' | 'past' = params.tab === 'past' ? 'past' : 'upcoming';
  const category = VALID_CATEGORIES.includes(params.category || '') ? (params.category as string) : 'all';
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
}: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const { tab, category, page } = parseParams(await searchParams);
  const catLabel = category !== 'all' ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  const parts: string[] = [];
  if (catLabel) parts.push(catLabel);
  parts.push(tab === 'past' ? 'Past Events' : 'Upcoming Events');
  if (page > 1) parts.push(`Page ${page}`);

  const title = parts.join(' — ');
  const description = tab === 'past'
    ? `Past ${catLabel ? catLabel.toLowerCase() + ' ' : ''}campus events across Nepal.`
    : `Browse upcoming ${catLabel ? catLabel.toLowerCase() + ' ' : ''}events across Nepal.`;

  return {
    title, description,
    alternates: { canonical: buildCanonical(tab, category, page) },
    openGraph: { title, description, type: 'website', url: buildCanonical(tab, category, page) },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { tab, category, page } = parseParams(await searchParams);
  const { events, totalCount } = await getEventsPage(tab, category, page, PAGE_SIZE);

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
            <LeftSidebar />

            <div className="w-full lg:mx-auto">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="lg:hidden flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Events</h2>
                    {session && <ClientAddEventButton />}
                  </div>
                  <div className="hidden lg:flex items-center justify-end mb-3">
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

            <RightSidebar exclude={['events']} />
          </div>
        </div>
      </div>
    </Layout>
  );
}