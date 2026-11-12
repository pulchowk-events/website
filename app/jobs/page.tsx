import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import JobCard from '@/app/components/jobs/JobCard';
import Pagination from '@/app/components/events/Pagination';
import { PageHeader } from '@/components/ui/PageHeader';
import { getJobsPage, getActiveJobTaxonomies } from '@/app/lib/queries';
import { JOB_ROLES } from '@/app/lib/seo';

export const revalidate = 60;

const PAGE_SIZE = 20;
const EMPLOYMENT_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];
const LOCATIONS = [
  { value: 'all', label: 'All locations' },
  { value: 'Kathmandu', label: 'Kathmandu' },
  { value: 'Lalitpur', label: 'Lalitpur' },
  { value: 'Bhaktapur', label: 'Bhaktapur' },
  { value: 'Pokhara', label: 'Pokhara' },
  { value: 'Remote', label: 'Remote' },
];

interface SearchParams {
  type?: string;
  location?: string;
  page?: string;
}

function parseParams(params: SearchParams) {
  const employmentType = EMPLOYMENT_TYPES.some((t) => t.value === params.type)
    ? (params.type as string)
    : 'all';
  const location = LOCATIONS.some((l) => l.value === params.location)
    ? (params.location as string)
    : 'all';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  return { employmentType, location, page };
}

function buildUrl(employmentType: string, location: string, page: number): string {
  const qs = new URLSearchParams();
  if (employmentType !== 'all') qs.set('type', employmentType);
  if (location !== 'all') qs.set('location', location);
  if (page > 1) qs.set('page', String(page));
  const q = qs.toString();
  return q ? '/jobs?' + q : '/jobs';
}

function titleCaseSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { employmentType, location, page } = parseParams(await searchParams);
  const typeLabel = EMPLOYMENT_TYPES.find((t) => t.value === employmentType)?.label;
  const locationLabel = LOCATIONS.find((l) => l.value === location)?.label;
  const parts: string[] = [];
  if (typeLabel && employmentType !== 'all') parts.push(typeLabel);
  parts.push('Jobs in Nepal');
  if (locationLabel && location !== 'all') parts.push('in ' + locationLabel);
  if (page > 1) parts.push('Page ' + page);
  const title = parts.join(' — ');
  const description =
    'Browse the latest tech, engineering, and internship opportunities across Nepal. Curated from top job boards and updated daily.';
  return {
    title,
    description,
    alternates: { canonical: buildUrl(employmentType, location, page) },
    openGraph: {
      title,
      description,
      type: 'website',
      url: buildUrl(employmentType, location, page),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { employmentType, location, page } = parseParams(await searchParams);

  const [activeTaxonomies, { jobs, totalCount }] = await Promise.all([
    getActiveJobTaxonomies(),
    getJobsPage(employmentType, location, page, PAGE_SIZE),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const from = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalCount);

  const hasTaxonomies =
    activeTaxonomies.companies.length > 0 ||
    activeTaxonomies.skills.length > 0 ||
    JOB_ROLES.length > 0;

  return (
    <Layout>
      <div className="w">
        <PageHeader
          eyebrow="Jobs"
          title="Jobs in Nepal."
          description="Tech, engineering, and internship opportunities — curated from Nepal's top job boards and updated daily."
        />

        <div className="jobs-filters">
          <div className="tabs" aria-label="Employment type">
            {EMPLOYMENT_TYPES.map((t) => {
              const active = employmentType === t.value;
              return (
                <Link
                  key={t.value}
                  href={buildUrl(t.value, location, 1)}
                  className={'tab' + (active ? ' tab--on' : '')}
                  aria-current={active ? 'page' : undefined}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
          <div className="tabs" aria-label="Location">
            {LOCATIONS.map((l) => {
              const active = location === l.value;
              return (
                <Link
                  key={l.value}
                  href={buildUrl(employmentType, l.value, 1)}
                  className={'tab' + (active ? ' tab--on' : '')}
                  aria-current={active ? 'page' : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="jobs-body">
          {totalCount > 0 && (
            <p className="events-toolbar__meta" style={{ marginBottom: 16 }}>
              Showing {from}–{to} of {totalCount} jobs
            </p>
          )}

          {jobs.length > 0 ? (
            <>
              <div className="jobs-list">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                buildUrl={(p) => buildUrl(employmentType, location, p)}
              />
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-state__title">No jobs match these filters.</p>
              <p className="empty-state__desc">
                Try a different employment type or location, or clear all filters.
              </p>
            </div>
          )}
        </div>

        {hasTaxonomies && jobs.length > 0 && (
          <div className="card jobs-taxonomies">
            {activeTaxonomies.companies.length > 0 && (
              <div>
                <p className="page-header__eyebrow" style={{ marginBottom: 12 }}>
                  Browse by company
                </p>
                <div className="tabs">
                  {activeTaxonomies.companies.map((c) => (
                    <Link key={c} href={'/jobs/company/' + c} className="tab">
                      {titleCaseSlug(c)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTaxonomies.skills.length > 0 && (
              <div>
                <p className="page-header__eyebrow" style={{ marginBottom: 12 }}>
                  Browse by skill
                </p>
                <div className="tabs">
                  {activeTaxonomies.skills.map((s) => (
                    <Link key={s} href={'/jobs/skills/' + s} className="tab">
                      {titleCaseSlug(s)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {JOB_ROLES.length > 0 && (
              <div>
                <p className="page-header__eyebrow" style={{ marginBottom: 12 }}>
                  Browse by role
                </p>
                <div className="tabs">
                  {JOB_ROLES.map((r) => (
                    <Link key={r.slug} href={'/jobs/role/' + r.slug} className="tab">
                      {r.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
