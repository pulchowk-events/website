import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Layout from "@/app/components/layout/Layout";
import JsonLd from "@/app/components/seo/JsonLd";
import { Avatar } from "@/app/components/ui/Avatar";
import { getClubs, getClubDetail, getClubFeed } from "@/app/lib/queries";
import type { ClubInfo } from "@/app/lib/queries";
import {
  CLUB_MIN_INDEXED_POSTS,
  instagramProfileUrl,
  slugOf,
} from "@/app/lib/clubs";
import { SITE_URL, breadcrumbSchema } from "@/app/lib/seo";
import ClubPostCard from "../ClubPostCard";

export const revalidate = 60;
export const dynamicParams = true;

const PAGE_SIZE = 24;

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) || "";
}

// Strip characters that could break out of the JSON-LD script tag.
function ld(s: string | null | undefined, max = 300): string {
  return (s || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

async function resolveClub(slug: string): Promise<ClubInfo | null> {
  const wanted = (slug || "").toLowerCase();
  const clubs = await getClubs();
  const matches = clubs.filter((c) => slugOf(c.username) === wanted);
  return matches.length === 1 ? matches[0] : null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const club = await resolveClub(slug);
  if (!club) return { title: "Club not found", robots: { index: false, follow: false } };

  const detail = await getClubDetail(club.username);
  const name = club.display_name || club.username;
  const count = detail ? detail.postCount : 0;
  const indexable = count >= CLUB_MIN_INDEXED_POSTS && !first(sp.before);
  const canonical = "/clubs/" + slugOf(club.username);
  const description =
    "Latest Instagram posts, events and announcements from " + name + " at Pulchowk Campus.";

  return {
    title: name,
    description,
    alternates: { canonical },
    openGraph: {
      title: name,
      description,
      type: "website",
      url: SITE_URL + canonical,
      images: club.avatar_url ? [club.avatar_url] : undefined,
    },
    twitter: { card: "summary", title: name, description },
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

export default async function ClubPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const club = await resolveClub(slug);
  if (!club) notFound();

  const beforeRaw = first(sp.before);
  const before =
    beforeRaw && !isNaN(Date.parse(beforeRaw)) ? new Date(beforeRaw).toISOString() : "";

  const [detail, feed] = await Promise.all([
    getClubDetail(club.username),
    getClubFeed({
      clubs: [club.username],
      eventsOnly: false,
      type: "",
      before,
      pageSize: PAGE_SIZE,
    }),
  ]);
  if (!detail) notFound();

  const { posts, hasMore, nextBefore } = feed;
  const name = club.display_name || club.username;
  const own = "/clubs/" + slugOf(club.username);
  const pageUrl = SITE_URL + own;
  const igUrl = instagramProfileUrl(club.username);
  const postCount = detail.postCount;
  const indexable = postCount >= CLUB_MIN_INDEXED_POSTS && !before;
  // Time math lives in the cached query (react-hooks/purity forbids Date.now here).
  const recent = detail.recent;

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Clubs", url: SITE_URL + "/clubs" },
    { name },
  ]);
  const orgJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ld(name, 120),
    url: pageUrl,
    sameAs: [igUrl],
  };
  if (club.avatar_url) orgJsonLd.logo = ld(club.avatar_url, 500);
  const listJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: ld(name, 120) + " posts",
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: ld(p.post_url, 500),
      name: ld(p.caption, 120) || "Instagram post",
    })),
  };

  return (
    <Layout>
      {indexable && <JsonLd data={breadcrumbJsonLd} />}
      {indexable && <JsonLd data={orgJsonLd} />}
      {indexable && posts.length > 0 && <JsonLd data={listJsonLd} />}

      <div className="club-feed">
        <section className="club-hero">
          <span className={"club-hero__ring" + (recent ? " club-hero__ring--on" : "")}>
            <span className="club-hero__dp">
              <Avatar src={club.avatar_url} name={name} size={84} />
            </span>
          </span>
          <div className="club-hero__body">
            <h1 className="club-hero__name">{name}</h1>
            <p className="club-hero__meta">
              <strong>{postCount}</strong> {postCount === 1 ? "post" : "posts"}
              <span className="club-hero__handle">@{club.username}</span>
            </p>
            <div className="club-hero__actions">
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="btn btn--secondary btn--sm"
              >
                View on Instagram
              </a>
              <Link href="/clubs" className="btn btn--secondary btn--sm">
                All clubs
              </Link>
            </div>
          </div>
        </section>

        {posts.length === 0 ? (
          <div className="empty-row">
            <p>No posts to show here.</p>
            <Link href={own} className="btn btn--secondary btn--sm">
              Newest posts
            </Link>
          </div>
        ) : (
          <div className="club-grid">
            {posts.map((p, i) => (
              <ClubPostCard key={p.id} post={p} index={i} linkClub={false} />
            ))}
          </div>
        )}

        {(hasMore || before) && (
          <div className="jobs-pager">
            <span className="jobs-pager__label">{posts.length} shown</span>
            <div className="jobs-pager__actions">
              {before && (
                <Link href={own} className="btn btn--secondary btn--sm">
                  Newest
                </Link>
              )}
              {hasMore && nextBefore && (
                <Link
                  href={own + "?before=" + encodeURIComponent(nextBefore)}
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
