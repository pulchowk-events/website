import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import { EventGridCard } from "@/app/components/events/EventGridCard";
import { PageHeader } from '@/components/ui/PageHeader';
import { getEventsByCity } from '@/app/lib/queries';
import { SITE_URL, breadcrumbSchema } from '@/app/lib/seo';
import JsonLd from '@/app/components/seo/JsonLd';

export const revalidate = 60;
export const dynamicParams = true;

const MIN_ITEMS = 3;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const { city } = await getEventsByCity(citySlug);
  const label = city || citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  const title = 'Events in ' + label;
  const description =
    'Browse upcoming events in ' + label + ', Nepal — hackathons, workshops, conferences, and more.';
  return {
    title,
    description,
    alternates: { canonical: '/events/location/' + citySlug },
    openGraph: {
      title,
      description,
      type: 'website',
      url: SITE_URL + '/events/location/' + citySlug,
    },
    twitter: { card: 'summary', title, description },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const { city, events } = await getEventsByCity(citySlug);
  if (!city || events.length < MIN_ITEMS) notFound();

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Events', url: SITE_URL + '/events' },
    { name: 'Events in ' + city },
  ]);

  const now = new Date();

  return (
    <Layout>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="w">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/events">Events</Link>
          <span>/</span>
          <span>{city}</span>
        </nav>

        <PageHeader
          eyebrow={'City · ' + events.length + ' events'}
          title={'Events in ' + city + '.'}
          description={
            events.length +
            ' ' +
            (events.length === 1 ? 'event' : 'events') +
            ' in ' +
            city +
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
