import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { getClubs, getClubFeed, getClubPostTypes, getClubStories } from "@/app/lib/queries";
import ClubPostCard from "./ClubPostCard";
import StoryRail from "./StoryRail";

export const revalidate = 60;

const PAGE_SIZE = 24;

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) || "";
}

interface Next {
  club: string[];
  events: boolean;
  type: string;
  before?: string;
}

function hrefFor(n: Next): string {
  const p = new URLSearchParams();
  if (n.club.length > 0) p.set("club", n.club.join(","));
  if (n.events) p.set("events", "1");
  if (n.type) p.set("type", n.type);
  if (n.before) p.set("before", n.before);
  const s = p.toString();
  return "/clubs" + (s ? "?" + s : "");
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = ["club", "events", "type", "before"].some((k) => first(sp[k]));
  return {
    title: "Club posts",
    description:
      "Latest Instagram posts from engineering clubs at Pulchowk Campus, in one feed. Workshops, hackathons, and announcements.",
    alternates: { canonical: "/clubs" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const [clubs, types, stories] = await Promise.all([
    getClubs(),
    getClubPostTypes(),
    getClubStories(),
  ]);

  const known = new Set(clubs.map((c) => c.username));
  const selected = Array.from(
    new Set(
      first(sp.club)
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => known.has(s)),
    ),
  ).sort();
  const eventsOnly = first(sp.events) === "1";
  const typeRaw = first(sp.type);
  const type = types.includes(typeRaw) ? typeRaw : "";
  const beforeRaw = first(sp.before);
  const before =
    beforeRaw && !isNaN(Date.parse(beforeRaw)) ? new Date(beforeRaw).toISOString() : "";

  const { posts, hasMore, nextBefore } = await getClubFeed({
    clubs: selected,
    eventsOnly,
    type,
    before,
    pageSize: PAGE_SIZE,
  });

  const cur: Next = { club: selected, events: eventsOnly, type };
  const hasFilters = selected.length > 0 || eventsOnly || !!type;

  const toggleClub = (u: string): string[] =>
    selected.includes(u) ? selected.filter((x) => x !== u) : [...selected, u].sort();

  const toggleHrefs: Record<string, string> = {};
  const viewAllHrefs: Record<string, string> = {};
  for (const c of clubs) {
    toggleHrefs[c.username] = hrefFor({ ...cur, club: toggleClub(c.username) });
    viewAllHrefs[c.username] = hrefFor({ club: [c.username], events: false, type: "" });
  }

  return (
    <Layout>
      <div className="club-feed">
        <PageHeader
          title="Clubs"
          description="Latest Instagram posts from campus clubs, newest first. Posts link to the original on Instagram."
        />

        {clubs.length > 0 && (
          <StoryRail
            clubs={clubs}
            stories={stories}
            selected={selected}
            toggleHrefs={toggleHrefs}
            viewAllHrefs={viewAllHrefs}
          />
        )}

        <div className="event-filters">
          <div className="event-filters__row club-filters-top">
            <div className="seg club-seg" role="group" aria-label="Post filter">
              <Link
                href={hrefFor({ ...cur, events: false })}
                className={"seg__item" + (!eventsOnly ? " seg__item--on" : "")}
              >
                All
              </Link>
              <Link
                href={hrefFor({ ...cur, events: true })}
                className={"seg__item" + (eventsOnly ? " seg__item--on" : "")}
              >
                Events
              </Link>
            </div>
            {hasFilters && (
              <Link href="/clubs" className="btn btn--secondary btn--sm club-clear">
                Clear all
              </Link>
            )}
          </div>

          {types.length > 0 && (
            <div className="event-filters__row event-filters__row--scroll">
              {types.map((t) => (
                <Link
                  key={t}
                  href={hrefFor({ ...cur, type: type === t ? "" : t })}
                  className={"chip" + (type === t ? " chip--on" : "")}
                >
                  {t}
                </Link>
              ))}
            </div>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="empty-row">
            <p>
              {hasFilters || before
                ? "No posts match these filters."
                : "No club posts yet. Check back soon."}
            </p>
            {(hasFilters || before) && (
              <Link href="/clubs" className="btn btn--secondary btn--sm">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="club-grid">
            {posts.map((p, i) => (
              <ClubPostCard key={p.id} post={p} index={i} />
            ))}
          </div>
        )}

        {(hasMore || before) && (
          <div className="jobs-pager">
            <span className="jobs-pager__label">{posts.length} shown</span>
            <div className="jobs-pager__actions">
              {before && (
                <Link href={hrefFor(cur)} className="btn btn--secondary btn--sm">
                  Newest
                </Link>
              )}
              {hasMore && nextBefore && (
                <Link
                  href={hrefFor({ ...cur, before: nextBefore })}
                  className="btn btn--secondary btn--sm"
                >
                  Older posts
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
