import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Layout from '@/app/components/layout/Layout';
import EventsClient from '@/app/components/events/EventsClient';
import ClientAddEventButton from '../components/events/ClientAddEventButton';
import { PageHeader } from '@/components/ui/PageHeader';
import { getEventsPage, getActiveEventTaxonomies } from '@/app/lib/queries';
import { formatMonthSlug } from '@/app/lib/seo';
import { isAdmin } from '@/app/lib/isAdmin';

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
  const { tab, category, page } = parseParams(await searchParams);
  const catLabel =
    category !== 'all' ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  const parts: string[] = [];
  if (catLabel) parts.push(catLabel);
  parts.push(tab === 'past' ? 'Past Events' : 'Upcoming Events');
  if (page > 1) parts.push(`Page ${page}`);

  const title = parts.join(' — ');
  const description =
    tab === 'past'
      ? `Past ${catLabel ? catLabel.toLowerCase() + ' ' : ''}campus events across Nepal.`
      : `Browse upcoming ${catLabel ? catLabel.toLowerCase() + ' ' : ''}events across Nepal.`;

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
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tab, category, page } = parseParams(await searchParams);

  const [{ events, totalCount }, eventTaxonomies, session] = await Promise.all([
    getEventsPage(tab, category, page, PAGE_SIZE),
    getActiveEventTaxonomies(),
    getServerSession(authOptions),
  ]);

  const admin = await isAdmin(session?.user?.email);

  const hasTaxonomyLinks =
    eventTaxonomies.months.length > 0 || eventTaxonomies.cities.length > 0;

  return (
    <Layout>
      <div className="w">
        <PageHeader
          eyebrow="Events"
          title={tab === 'past' ? 'Past events.' : 'Vetted campus events.'}
          description={
            tab === 'past'
              ? 'Archive of everything that already happened.'
              : 'Every listing is human-reviewed before it appears here. Filter by category, month, or city.'
          }
          action={session ? <ClientAddEventButton /> : undefined}
        />

        <div className="card" style={{ marginBottom: 32 }}>
          <EventsClient
            events={events}
            totalCount={totalCount}
            page={page}
            pageSize={PAGE_SIZE}
            tab={tab}
            category={category}
            isAdmin={admin}
          />
        </div>

        {hasTaxonomyLinks && (
          <div className="card" style={{ marginBottom: 32 }}>
            {eventTaxonomies.months.length > 0 && (
              <div style={{ marginBottom: eventTaxonomies.cities.length > 0 ? 24 : 0 }}>
                <p className="page-header__eyebrow" style={{ marginBottom: 12 }}>
                  Browse by month
                </p>
                <div className="tabs">
                  {eventTaxonomies.months.map((m) => {
                    const label = formatMonthSlug(m) || m;
                    return (
                      <Link key={m} href={'/events/month/' + m} className="tab">
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {eventTaxonomies.cities.length > 0 && (
              <div>
                <p className="page-header__eyebrow" style={{ marginBottom: 12 }}>
                  Browse by location
                </p>
                <div className="tabs">
                  {eventTaxonomies.cities.map((c) => {
                    const label = c
                      .split('-')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ');
                    return (
                      <Link key={c} href={'/events/location/' + c} className="tab">
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
