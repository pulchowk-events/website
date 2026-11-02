import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import LeftSidebar from '@/app/components/layout/LeftSidebar';
import RightSidebar from '@/app/components/layout/RightSidebar';
import JobCard from '@/app/components/jobs/JobCard';
import Pagination from '@/app/components/events/Pagination';
import { getJobsPage } from '@/app/lib/queries';
import { SITE_URL } from '@/app/lib/seo';

export const revalidate = 60;

const PAGE_SIZE = 20;
const EMPLOYMENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];
const LOCATIONS = [
  { value: 'all', label: 'All Locations' },
  { value: 'Kathmandu', label: 'Kathmandu' },
  { value: 'Lalitpur', label: 'Lalitpur' },
  { value: 'Bhaktapur', label: 'Bhaktapur' },
  { value: 'Pokhara', label: 'Pokhara' },
  { value: 'Remote', label: 'Remote' },
];

interface SearchParams { type?: string; location?: string; page?: string }

function parseParams(params: SearchParams) {
  const employmentType = EMPLOYMENT_TYPES.some((t) => t.value === params.type) ? (params.type as string) : 'all';
  const location = LOCATIONS.some((l) => l.value === params.location) ? (params.location as string) : 'all';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  return { employmentType, location, page };
}

function buildUrl(employmentType: string, location: string, page: number): string {
  const qs = new URLSearchParams();
  if (employmentType !== 'all') qs.set('type', employmentType);
  if (location !== 'all') qs.set('location', location);
  if (page > 1) qs.set('page', String(page));
  const q = qs.toString();
  return q ? `/jobs?${q}` : '/jobs';
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const { employmentType, location, page } = parseParams(await searchParams);
  const typeLabel = EMPLOYMENT_TYPES.find((t) => t.value === employmentType)?.label;
  const locationLabel = LOCATIONS.find((l) => l.value === location)?.label;
  const parts: string[] = [];
  if (typeLabel && employmentType !== 'all') parts.push(typeLabel);
  parts.push('Jobs in Nepal');
  if (locationLabel && location !== 'all') parts.push(`in ${locationLabel}`);
  if (page > 1) parts.push(`Page ${page}`);
  const title = parts.join(' — ');
  const description = 'Browse the latest tech, engineering, and internship opportunities across Nepal. Curated from top job boards and updated daily.';
  return {
    title, description,
    alternates: { canonical: buildUrl(employmentType, location, page) },
    openGraph: { title, description, type: 'website', url: buildUrl(employmentType, location, page) },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { employmentType, location, page } = parseParams(await searchParams);
  const { jobs, totalCount } = await getJobsPage(employmentType, location, page, PAGE_SIZE);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const from = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            <LeftSidebar />

            <div className="w-full lg:mx-auto">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden p-4 sm:p-5">
                <header className="mb-5">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Jobs in Nepal</h1>
                  <p className="text-muted-foreground">
                    Latest tech, engineering, and internship opportunities — curated and updated daily.
                  </p>
                </header>

                <div className="space-y-3 mb-5">
                  <div className="flex flex-wrap gap-2">
                    {EMPLOYMENT_TYPES.map((t) => {
                      const active = employmentType === t.value;
                      return (
                        <Link key={t.value} href={buildUrl(t.value, location, 1)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            active ? 'bg-green-600 text-white' : 'bg-muted text-foreground hover:bg-accent'
                          }`}>
                          {t.label}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((l) => {
                      const active = location === l.value;
                      return (
                        <Link key={l.value} href={buildUrl(employmentType, l.value, 1)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            active ? 'bg-green-600 text-white' : 'bg-muted text-foreground hover:bg-accent'
                          }`}>
                          {l.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {totalCount > 0 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing {from}–{to} of {totalCount} jobs
                  </p>
                )}

                {jobs.length > 0 ? (
                  <>
                    <div className="space-y-4">
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
                  <div className="text-center py-16 bg-muted/30 border border-border rounded-xl">
                    <p className="text-muted-foreground">
                      No jobs found matching these filters. Try removing a filter.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <RightSidebar exclude={['jobs']} />
          </div>
        </div>
      </div>
    </Layout>
  );
}