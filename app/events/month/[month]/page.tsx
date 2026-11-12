import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import { EventGridCard } from "@/app/components/events/EventGridCard";
import { PageHeader } from '@/components/ui/PageHeader';
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

  const title = 'Events in ' + label;
  const description =
    'Browse ' + label + ' events across Nepal — hackathons, workshops, conferences, and more.';
  return {
    title,
    description,
    alternates: { canonical: '/events/month/' + month },
    openGraph: {
      title,
      description,
      type: 'website',
      url: SITE_URL + '/events/month/' + month,
    },
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
    { name: 'Events', url: SITE_URL + '/events' },
    { name: label },
  ]);

  const now = new Date();

  return (
    <Layout>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="w">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/events">Events</Link>
          <span>/</span>
          <span>{label}</span>
        </nav>

        <PageHeader
          eyebrow={'Month · ' + events.length + ' events'}
          title={'Events in ' + label + '.'}
          description={
            events.length +
            ' ' +
            (events.length === 1 ? 'event' : 'events') +
            ' happening in ' +
            label +
            '.'
          }
        />

        <div className="events-grid">
          {events.map((event) => (
            <EventGridCard key={event.id} event={event as any} />
          ))}
        </div>

        <div style={{ marginTop: 32 }}>
          <Link href="/events" className="btn btn--secondary">
            <span className="btn__label">← Browse all events</span>
            <span className="btn__label btn__label--dup" aria-hidden="true">
              ← Browse all events
            </span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
