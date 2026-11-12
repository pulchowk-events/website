import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import EventCard from '@/app/components/events/EventCard';
import { getEventsByMonth } from '@/app/lib/queries';
import { SITE_URL, breadcrumbSchema, formatMonthSlug } from '@/app/lib/seo';
import JsonLd from '@/app/components/seo/JsonLd';

export const revalidate = 60;
export const dynamicParams = true;

const MIN_ITEMS = 3;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ month: string }>;
}): Promise<Metadata> {
  const { month } = await params;
  const label = formatMonthSlug(month);
  if (!label) return { title: 'Month Not Found' };

  const title = `Events in ${label}`;
  const description = `Browse ${label} events across Nepal — hackathons, workshops, conferences, and more.`;
  return {
    title,
    description,
    alternates: { canonical: `/events/month/${month}` },
    openGraph: { title, description, type: 'website', url: `${SITE_URL}/events/month/${month}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function MonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const label = formatMonthSlug(month);
  if (!label) notFound();

  const { events } = await getEventsByMonth(month);
  if (events.length < MIN_ITEMS) notFound();

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Events', url: `${SITE_URL}/events` },
    { name: label },
  ]);

  const now = new Date();

  return (
    <Layout>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="bg-background min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            <div className="w-full lg:mx-auto lg:min-h-[calc(100vh-8rem)]">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden p-4 sm:p-5">
                <nav className="mb-3 text-sm text-muted-foreground">
                  <Link href="/events" className="hover:text-foreground">Events</Link>
                  {' / '}
                  <span className="text-foreground">{label}</span>
                </nav>
                <header className="mb-5">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Events in {label}
                  </h1>
                  <p className="text-muted-foreground">
                    {events.length} {events.length === 1 ? 'event' : 'events'} happening in {label}.
                  </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event as any}
                      isPast={new Date(event.event_date) < now}
                      isAdmin={false}
                    />
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <Link
                    href="/events"
                    className="inline-flex items-center text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    ← Browse all events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}