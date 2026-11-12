import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventFilters } from "@/app/components/events/EventFilters";
import { readEventFilters } from "@/app/lib/eventFilters";
import { EventGridCard } from "@/app/components/events/EventGridCard";
import { EventListWrapper } from "@/app/components/events/EventListWrapper";
import { EventComposer } from "@/app/components/events/EventComposer";
import { getEventsPage, getSavedIds, getActiveEventTaxonomies } from "@/app/lib/queries";
import { formatMonthSlug } from "@/app/lib/seo";
import { isAdmin } from "@/app/lib/isAdmin";

export const revalidate = 60;

const PAGE_SIZE = 48;

interface SearchParams {
  tab?: string;
  cat?: string;
  when?: string;
  city?: string;
  price?: string;
  view?: string;
  page?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ["tab", "cat", "when", "city", "price", "view", "page"] as const) {
    if (sp[k]) qs.set(k, String(sp[k]));
  }
  const s = qs.toString();
  return {
    title: "Events",
    description: "Browse verified campus events across Nepal — hackathons, workshops, concerts, and more.",
    alternates: { canonical: "/events" + (s ? "?" + s : "") },
  };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v !== undefined) urlParams.set(k, String(v));
  }
  const filters = readEventFilters(urlParams);
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const session = await getServerSession(authOptions);
  const [adminFlag, saves, eventTaxonomies] = await Promise.all([
    session?.user?.email ? isAdmin(session.user.email) : Promise.resolve(false),
    getSavedIds(session?.user?.id, "event"),
    getActiveEventTaxonomies(),
  ]);

  const { events, totalCount } = await getEventsPage({
    tab: filters.tab,
    category: filters.category,
    when: filters.when,
    city: filters.city,
    price: filters.price,
    page,
    pageSize: PAGE_SIZE,
  });

  const hasTaxonomies = eventTaxonomies.months.length > 0 || eventTaxonomies.cities.length > 0;

  return (
    <Layout railContext="events">
      <PageHeader
        title="Events"
        count={totalCount + (totalCount === 1 ? " event" : " events")}
        actions={
          session ? (
            <Link href="/events/new" className="btn btn--secondary btn--sm">
              Add event
            </Link>
          ) : undefined
        }
      />

      {session?.user?.id && <EventComposer userId={session.user.id} />}
      <EventFilters state={filters} />

      {events.length === 0 ? (
        <div className="empty-row">
          <p>No events match these filters.</p>
          {filters.category !== "all" || filters.when !== "all" || filters.city !== "all" || filters.price !== "all" ? (
            <Link href={filters.tab === "past" ? "/events?tab=past" : "/events"} className="btn btn--secondary btn--sm">
              Clear filters
            </Link>
          ) : (
            <Link href="/events/new" className="btn btn--primary btn--sm">
              Submit the first one
            </Link>
          )}
        </div>
      ) : filters.view === "grid" ? (
        <div className="event-grid">
          {events.map((e: any) => <EventGridCard key={e.id} event={e} />)}
        </div>
      ) : (
        <EventListWrapper
          events={events}
          isPast={filters.tab === "past"}
          savedIds={Array.from(saves)}
          userId={session?.user?.id}
          isAdmin={adminFlag}
        />
      )}

      {hasTaxonomies && (
        <section className="event-taxonomies">
          {eventTaxonomies.months.length > 0 && (
            <div>
              <p className="event-taxonomies__label">Browse by month</p>
              <div className="event-taxonomies__list">
                {eventTaxonomies.months.map((m) => (
                  <Link key={m} href={"/events/month/" + m} className="chip">
                    {formatMonthSlug(m) || m}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {eventTaxonomies.cities.length > 0 && (
            <div>
              <p className="event-taxonomies__label">Browse by city</p>
              <div className="event-taxonomies__list">
                {eventTaxonomies.cities.map((c) => (
                  <Link key={c} href={"/events/location/" + c} className="chip">
                    {c.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </Layout>
  );
}
