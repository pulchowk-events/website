import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { JobsFilterPanel } from "@/app/components/jobs/JobsFilterPanel";
import { JobsClient } from "@/app/components/jobs/JobsClient";
import { JobsActiveFilters } from "@/app/components/jobs/JobsActiveFilters";
import {
  getJobsPage,
  getJobFacets,
  getSavedIds,
  getActiveJobTaxonomies,
} from "@/app/lib/queries";
import { JOB_ROLES } from "@/app/lib/seo";

export const revalidate = 60;

const PAGE_SIZE = 20;

interface SearchParams {
  q?: string;
  type?: string;
  loc?: string;
  posted?: string;
  source?: string;
  salary?: string;
  closing?: string;
  sort?: string;
  page?: string;
  id?: string;
}

function parseParams(sp: SearchParams) {
  const toList = (v: string | undefined) => (v ? v.split(",").filter(Boolean) : []);
  return {
    q: (sp.q || "").trim(),
    types: toList(sp.type),
    locations: toList(sp.loc),
    posted: sp.posted || "any",
    sources: toList(sp.source),
    salaryDisclosed: sp.salary === "1",
    closingSoon: sp.closing === "1",
    sort: (sp.sort === "closing" ? "closing" : "new") as "new" | "closing",
    page: Math.max(1, parseInt(sp.page || "1", 10) || 1),
  };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const sp = await searchParams;
  const params = parseParams(sp);
  const parts: string[] = [];
  if (params.types.length > 0) parts.push(params.types.join(", "));
  parts.push("Jobs in Nepal");
  if (params.locations.length > 0) parts.push("in " + params.locations.join(", "));
  if (params.page > 1) parts.push("Page " + params.page);
  const title = parts.join(" \u2014 ");
  const description = "Browse tech, engineering, and internship opportunities across Nepal, curated from the top job boards.";
  return {
    title,
    description,
    alternates: { canonical: "/jobs" },
  };
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const params = parseParams(sp);
  const session = await getServerSession(authOptions);

  const [facets, { jobs, totalCount }, saves, taxonomies] = await Promise.all([
    getJobFacets(),
    getJobsPage({
      q: params.q,
      types: params.types,
      locations: params.locations,
      posted: params.posted,
      sources: params.sources,
      salaryDisclosed: params.salaryDisclosed,
      closingSoon: params.closingSoon,
      sort: params.sort,
      page: params.page,
      pageSize: PAGE_SIZE,
    }),
    getSavedIds(session?.user?.id, "job"),
    getActiveJobTaxonomies(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasTaxonomies =
    taxonomies.companies.length > 0 || taxonomies.skills.length > 0 || JOB_ROLES.length > 0;

  return (
    <Layout railContext="jobs">
      <PageHeader
        title="Jobs"
        count={totalCount + (totalCount === 1 ? " job" : " jobs")}
      />

      <JobsActiveFilters />

      <div className="jobs-layout">
        <JobsFilterPanel facets={facets} />
        <div className="jobs-layout__results">
          <JobsClient
            jobs={jobs}
            totalCount={totalCount}
            savedIds={Array.from(saves)}
            page={params.page}
            totalPages={totalPages}
          />
        </div>
      </div>

      {hasTaxonomies && jobs.length > 0 && (
        <section className="event-taxonomies">
          {taxonomies.companies.length > 0 && (
            <div>
              <p className="event-taxonomies__label">By company</p>
              <div className="event-taxonomies__list">
                {taxonomies.companies.map((c) => (
                  <Link key={c} href={"/jobs/company/" + c} className="chip">
                    {c.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {taxonomies.skills.length > 0 && (
            <div>
              <p className="event-taxonomies__label">By skill</p>
              <div className="event-taxonomies__list">
                {taxonomies.skills.map((s) => (
                  <Link key={s} href={"/jobs/skills/" + s} className="chip">
                    {s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {JOB_ROLES.length > 0 && (
            <div>
              <p className="event-taxonomies__label">By role</p>
              <div className="event-taxonomies__list">
                {JOB_ROLES.map((r) => (
                  <Link key={r.slug} href={"/jobs/role/" + r.slug} className="chip">
                    {r.label}
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
