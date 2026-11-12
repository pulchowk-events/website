import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import EventDetail from "@/app/components/events/EventDetail";
import JsonLd from "@/app/components/seo/JsonLd";
import {
  getEventById,
  getSimilarEvents,
  getEventsByOrganizer,
  getSavedIds,
} from "@/app/lib/queries";
import { SITE_URL, breadcrumbSchema } from "@/app/lib/seo";
import { isAdmin } from "@/app/lib/isAdmin";
import { formatDateLong } from "@/app/lib/formatDate";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!id) return { title: "Event Not Found" };
  const event = await getEventById(id);
  if (!event) return { title: "Event Not Found" };

  const description = (event.description || "").slice(0, 160).replace(/\\s+/g, " ").trim();
  const eventDate = formatDateLong(event.event_date);
  const fallback = event.title + " on " + eventDate + (event.location ? " at " + event.location : "") + ".";

  return {
    title: event.title,
    description: description || fallback,
    alternates: { canonical: "/events/" + id },
    openGraph: {
      title: event.title,
      description: description || fallback,
      type: "article",
      url: "/events/" + id,
      images: event.image_url ? [event.image_url] : [SITE_URL + "/events/" + id + "/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: description || fallback,
      images: event.image_url ? [event.image_url] : [SITE_URL + "/events/" + id + "/opengraph-image"],
    },
  };
}

export default async function EventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const initialEditMode = sp.edit === "true";
  if (!id) notFound();
  const event = await getEventById(id);
  if (!event) notFound();

  const session = await getServerSession(authOptions);
  const [adminFlag, saves, similarEvents, moreFromOrganizer] = await Promise.all([
    session?.user?.email ? isAdmin(session.user.email) : Promise.resolve(false),
    getSavedIds(session?.user?.id, "event"),
    getSimilarEvents(id, event.category, 4),
    getEventsByOrganizer(event.organizer, id, 3),
  ]);

  const isPast = new Date(event.event_date) < new Date();

  const eventJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: (event.description || "").slice(0, 500),
    startDate: event.event_date,
    image: event.image_url ? [event.image_url] : undefined,
    url: SITE_URL + "/events/" + event.id,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.attendance_mode === "online"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : event.attendance_mode === "hybrid"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    location: event.location
      ? { "@type": "Place", name: event.location, address: event.location }
      : { "@type": "VirtualLocation", url: event.form_link || SITE_URL + "/events/" + event.id },
    organizer: event.organizer
      ? { "@type": "Organization", name: event.organizer }
      : { "@type": "Organization", name: "Pulchowk Events", url: SITE_URL },
    offers: !isPast ? {
      "@type": "Offer",
      price: event.price || "0",
      priceCurrency: "NPR",
      availability: "https://schema.org/InStock",
      url: event.form_link || SITE_URL + "/events/" + event.id,
    } : undefined,
  };

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Events", url: SITE_URL + "/events" },
    { name: event.title },
  ]);

  return (
    <Layout railContext="events">
      <JsonLd data={eventJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <EventDetail
        event={event}
        isAdmin={adminFlag}
        isSaved={saves.has(id)}
        userId={session?.user?.id}
        similarEvents={similarEvents}
        moreFromOrganizer={moreFromOrganizer}
        savedIds={Array.from(saves)}
        initialEditMode={initialEditMode}
      />
    </Layout>
  );
}
