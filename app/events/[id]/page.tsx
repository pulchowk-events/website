import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Layout from '@/app/components/layout/Layout';
import LeftSidebar from '@/app/components/layout/LeftSidebar';
import RightSidebar from '@/app/components/layout/RightSidebar';
import EventDetail from '@/app/components/events/EventDetail';
import JsonLd from '@/app/components/seo/JsonLd';
import { getEventById } from '@/app/lib/queries';
import { SITE_URL, breadcrumbSchema } from '@/app/lib/seo';

export const revalidate = 60;

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!id) return { title: 'Event Not Found' };
  const event = await getEventById(id);
  if (!event) return { title: 'Event Not Found' };

  const description = (event.description || '').slice(0, 160).replace(/\s+/g, ' ').trim();
  const eventDate = new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const fallback = `${event.title} on ${eventDate}${event.location ? ` at ${event.location}` : ''}.`;

  return {
    title: event.title,
    description: description || fallback,
    alternates: { canonical: `/events/${id}` },
    openGraph: {
      title: event.title, description: description || fallback,
      type: 'article', url: `/events/${id}`,
      images: event.image_url ? [event.image_url] : [`${SITE_URL}/events/${id}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image', title: event.title, description: description || fallback,
      images: event.image_url ? [event.image_url] : [`${SITE_URL}/events/${id}/opengraph-image`],
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();
  const event = await getEventById(id);
  if (!event) notFound();

  const session = await getServerSession(authOptions);
  let isAdmin = false;
  if (session?.user?.email) {
    try {
      const r = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`, { cache: 'no-store' });
      const { isAdmin: a } = await r.json();
      isAdmin = a;
    } catch (err) { console.error(err); }
  }

  const isPast = new Date(event.event_date) < new Date();

  const eventJsonLd: Record<string, any> = {
    '@context': 'https://schema.org', '@type': 'Event',
    name: event.title,
    description: (event.description || '').slice(0, 500),
    startDate: event.event_date,
    image: event.image_url ? [event.image_url] : undefined,
    url: `${SITE_URL}/events/${event.id}`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.attendance_mode === 'online'
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : event.attendance_mode === 'hybrid'
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    location: event.location
      ? { '@type': 'Place', name: event.location, address: event.location }
      : { '@type': 'VirtualLocation', url: event.form_link || `${SITE_URL}/events/${event.id}` },
    organizer: event.organizer
      ? { '@type': 'Organization', name: event.organizer }
      : { '@type': 'Organization', name: 'Pulchowk Events', url: SITE_URL },
    offers: !isPast ? {
      '@type': 'Offer',
      price: event.price || '0', priceCurrency: 'NPR',
      availability: 'https://schema.org/InStock',
      url: event.form_link || `${SITE_URL}/events/${event.id}`,
    } : undefined,
  };

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Events', url: `${SITE_URL}/events` },
    { name: event.title },
  ]);

  return (
    <Layout>
      <JsonLd data={eventJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="bg-background min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            <LeftSidebar />
            <div className="w-full lg:mx-auto">
              <div className="bg-card border border-border rounded-xl shadow-lg p-5 sm:p-6">
                <EventDetail event={event} isAdmin={isAdmin} />
              </div>
            </div>
            <RightSidebar exclude={['events']} />
          </div>
        </div>
      </div>
    </Layout>
  );
}