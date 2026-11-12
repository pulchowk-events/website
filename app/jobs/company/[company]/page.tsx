import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import JobCard from '@/app/components/jobs/JobCard';
import { PageHeader } from '@/components/ui/PageHeader';
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
  const title = 'Jobs at ' + label + ' in Nepal';
  const description =
    'Browse open roles at ' + label + ' in Nepal. Curated from top job boards and updated daily.';
  return {
    title,
    description,
    alternates: { canonical: '/jobs/company/' + companySlug },
    openGraph: {
      title,
      description,
      type: 'website',
      url: SITE_URL + '/jobs/company/' + companySlug,
    },
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
    { name: 'Jobs', url: SITE_URL + '/jobs' },
    { name: company + ' Jobs' },
  ]);

  return (
    <Layout>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="w">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/jobs">Jobs</Link>
          <span>/</span>
          <span>{company}</span>
        </nav>

        <PageHeader
          eyebrow={'Company · ' + jobs.length + ' open'}
          title={'Jobs at ' + company + '.'}
          description={"Open roles at " + company + " in Nepal, curated from top job boards."}
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
