import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Layout from '@/app/components/layout/Layout';
import EventDetail from '@/app/components/events/EventDetail';
import { getEventById } from '@/app/lib/queries';

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!id) return { title: 'Event Not Found | Pulchowk Events' };

  const event = await getEventById(id);
  if (!event) return { title: 'Event Not Found | Pulchowk Events' };

  const description = (event.description || '')
    .slice(0, 160)
    .replace(/\s+/g, ' ')
    .trim();
  const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    title: `${event.title} | Pulchowk Events`,
    description:
      description ||
      `${event.title} on ${eventDate}${event.location ? ` at ${event.location}` : ''}.`,
    openGraph: {
      title: event.title,
      description,
      images: event.image_url ? [event.image_url] : [],
      type: 'article',
    },
    alternates: { canonical: `/events/${id}` },
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
      const response = await fetch(
        `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`,
        { cache: 'no-store' }
      );
      const { isAdmin: adminStatus } = await response.json();
      isAdmin = adminStatus;
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  }

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <EventDetail event={event} isAdmin={isAdmin} />
        </div>
      </div>
    </Layout>
  );
}