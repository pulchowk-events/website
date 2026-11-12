import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import JobCard from '@/app/components/jobs/JobCard';
import { getJobsByCompany } from '@/app/lib/queries';
import { SITE_URL, breadcrumbSchema, deslugify } from '@/app/lib/seo';
import JsonLd from '@/app/components/seo/JsonLd';

export const revalidate = 60;
export const dynamicParams = true;

const MIN_ITEMS = 3;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ company: string }>;
}): Promise<Metadata> {
  const { company: companySlug } = await params;
  const { company } = await getJobsByCompany(companySlug);
  const label = company || deslugify(companySlug);

  const title = `${label} Jobs`;
  const description = `Open roles at ${label}. Updated daily from Nepal's top job boards.`;
  return {
    title,
    description,
    alternates: { canonical: `/jobs/company/${companySlug}` },
    openGraph: { title, description, type: 'website', url: `${SITE_URL}/jobs/company/${companySlug}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;
  const { company, jobs } = await getJobsByCompany(companySlug);
  if (!company || jobs.length < MIN_ITEMS) notFound();

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Jobs', url: `${SITE_URL}/jobs` },
    { name: `${company} Jobs` },
  ]);

  return (
    <Layout>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="bg-background min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            <div className="w-full lg:mx-auto lg:min-h-[calc(100vh-8rem)]">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden p-4 sm:p-5">
                <nav className="mb-3 text-sm text-muted-foreground">
                  <Link href="/jobs" className="hover:text-foreground">Jobs</Link>
                  {' / '}
                  <span className="text-foreground">{company}</span>
                </nav>
                <header className="mb-5">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Jobs at {company}
                  </h1>
                  <p className="text-muted-foreground">
                    {jobs.length} open {jobs.length === 1 ? 'role' : 'roles'} currently hiring.
                  </p>
                </header>

                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <Link
                    href="/jobs"
                    className="inline-flex items-center text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    ← Browse all jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}