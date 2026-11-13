import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScholarshipFilterBar } from "@/app/components/scholarships/ScholarshipFilterBar";
import { ScholarshipsClient } from "@/app/components/scholarships/ScholarshipsClient";
import {
  getScholarshipsPage,
  getSavedIds,
  getActiveScholarshipCountries,
  getActiveScholarshipLevels,
} from "@/app/lib/queries";

export const revalidate = 60;

const PAGE_SIZE = 24;

interface SearchParams {
  q?: string;
  degree?: string;
  country?: string;
  status?: string;
  sort?: string;
  page?: string;
}

function parseParams(sp: SearchParams) {
  return {
    q: (sp.q || "").trim(),
    degree: sp.degree || "any",
    country: sp.country || "any",
    status: sp.status || "any",
    sort: (sp.sort === "closing" ? "closing" : "new") as "new" | "closing",
    page: Math.max(1, parseInt(sp.page || "1", 10) || 1),
  };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const sp = await searchParams;
  const params = parseParams(sp);
  const parts: string[] = [];
  if (params.degree !== "any") parts.push(params.degree);
  parts.push("Scholarships");
  if (params.country !== "any") parts.push("for " + params.country);
  if (params.page > 1) parts.push("Page " + params.page);
  return {
    title: parts.join(" \u2014 "),
    description:
      "Fully and partially funded scholarships for Nepali students \u2014 Bachelor, Masters, PhD, and fellowships from around the world.",
    alternates: { canonical: "/scholarships" },
  };
}

export default async function ScholarshipsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const params = parseParams(sp);
  const session = await getServerSession(authOptions);

  const [result, saves, countries, levels] = await Promise.all([
    getScholarshipsPage({ ...params, pageSize: PAGE_SIZE }),
    getSavedIds(session?.user?.id, "scholarship"),
    getActiveScholarshipCountries(),
    getActiveScholarshipLevels(),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.totalCount / PAGE_SIZE));
  const hasTaxonomies = countries.length > 0 || levels.length > 0;

  return (
    <Layout railContext="utility">
      <PageHeader title="Scholarships" />
      <ScholarshipFilterBar />
      <ScholarshipsClient
        scholarships={result.scholarships}
        savedIds={Array.from(saves)}
        page={params.page}
        totalPages={totalPages}
      />

      {hasTaxonomies && result.scholarships.length > 0 && (
        <section className="event-taxonomies">
          {countries.length > 0 && (
            <div>
              <p className="event-taxonomies__label">By country</p>
              <div className="event-taxonomies__list">
                {countries.map((c) => (
                  <Link key={c.slug} href={"/scholarships/country/" + c.slug} className="chip">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {levels.length > 0 && (
            <div>
              <p className="event-taxonomies__label">By level</p>
              <div className="event-taxonomies__list">
                {levels.map((l) => (
                  <Link key={l.slug} href={"/scholarships/level/" + l.slug} className="chip">
                    {l.label}
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
