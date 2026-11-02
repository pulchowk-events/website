import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import LeftSidebar from '@/app/components/layout/LeftSidebar';
import RightSidebar from '@/app/components/layout/RightSidebar';
import JobCard from '@/app/components/jobs/JobCard';
import { getJobsByRole } from '@/app/lib/queries';
import { SITE_URL, JOB_ROLES, breadcrumbSchema } from '@/app/lib/seo';
import JsonLd from '@/app/components/seo/JsonLd';

export const revalidate = 60;
export const dynamicParams = true;

const MIN_ITEMS = 3;

export async function generateStaticParams() {
  return JOB_ROLES.map((r) => ({ role: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role } = await params;
  const roleDef = JOB_ROLES.find((r) => r.slug === role);
  if (!roleDef) return { title: 'Role Not Found' };

  const title = `${roleDef.label} Jobs in Nepal`;
  const description = `Browse ${roleDef.label} roles across Nepal. Curated from top job boards and updated daily.`;
  return {
    title,
    description,
    alternates: { canonical: `/jobs/role/${role}` },
    openGraph: { title, description, type: 'website', url: `${SITE_URL}/jobs/role/${role}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function RolePage({ params }: { params: Promise<{ role: string }> }) {
  const { role: roleSlug } = await params;
  const { role, jobs } = await getJobsByRole(roleSlug);
  if (!role || jobs.length < MIN_ITEMS) notFound();

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Jobs', url: `${SITE_URL}/jobs` },
    { name: `${role.label} Jobs` },
  ]);

  return (
    <Layout>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="bg-background min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            <LeftSidebar />
            <div className="w-full lg:mx-auto lg:min-h-[calc(100vh-8rem)]">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden p-4 sm:p-5">
                <nav className="mb-3 text-sm text-muted-foreground">
                  <Link href="/jobs" className="hover:text-foreground">Jobs</Link>
                  {' / '}
                  <span className="text-foreground">{role.label}</span>
                </nav>
                <header className="mb-5">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {role.label} Jobs in Nepal
                  </h1>
                  <p className="text-muted-foreground">
                    {jobs.length} {jobs.length === 1 ? 'role' : 'roles'} matching {role.label} —
                    curated from Nepal&apos;s top job boards.
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
            <RightSidebar exclude={['jobs']} />
          </div>
        </div>
      </div>
    </Layout>
  );
}