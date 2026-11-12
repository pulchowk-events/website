import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import JobCard from '@/app/components/jobs/JobCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { getJobsByRole } from '@/app/lib/queries';
import { SITE_URL, JOB_ROLES, breadcrumbSchema } from '@/app/lib/seo';
import JsonLd from '@/app/components/seo/JsonLd';

export const revalidate = 60;
export const dynamicParams = true;

const MIN_ITEMS = 3;

export async function generateStaticParams() {
  return JOB_ROLES.map((r) => ({ roles: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roles: string }>;
}): Promise<Metadata> {
  const { roles: roleSlug } = await params;
  const roleDef = JOB_ROLES.find((r) => r.slug === roleSlug);
  if (!roleDef) return { title: 'Role Not Found' };

  const title = roleDef.label + ' Jobs in Nepal';
  const description =
    'Browse ' + roleDef.label + ' roles across Nepal. Curated from top job boards and updated daily.';
  return {
    title,
    description,
    alternates: { canonical: '/jobs/role/' + roleSlug },
    openGraph: {
      title,
      description,
      type: 'website',
      url: SITE_URL + '/jobs/role/' + roleSlug,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function RolePage({
  params,
}: {
  params: Promise<{ roles: string }>;
}) {
  const { roles: roleSlug } = await params;
  const { role, jobs } = await getJobsByRole(roleSlug);
  if (!role || jobs.length < MIN_ITEMS) notFound();

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Jobs', url: SITE_URL + '/jobs' },
    { name: role.label + ' Jobs' },
  ]);

  return (
    <Layout>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="w">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/jobs">Jobs</Link>
          <span>/</span>
          <span>{role.label}</span>
        </nav>

        <PageHeader
          eyebrow={'Role · ' + jobs.length + ' open'}
          title={role.label + ' jobs in Nepal.'}
          description="Curated from Nepal's top job boards, updated daily."
        />

        <div className="jobs-list">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div style={{ marginTop: 32 }}>
          <Link href="/jobs" className="btn btn--secondary">
            <span className="btn__label">← Browse all jobs</span>
            <span className="btn__label btn__label--dup" aria-hidden="true">
              ← Browse all jobs
            </span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
