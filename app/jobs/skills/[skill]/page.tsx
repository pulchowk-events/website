import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import JobCard from '@/app/components/jobs/JobCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { getJobsBySkill } from '@/app/lib/queries';
import { SITE_URL, breadcrumbSchema, deslugify, slugify } from '@/app/lib/seo';
import JsonLd from '@/app/components/seo/JsonLd';

export const revalidate = 60;
export const dynamicParams = true;

const MIN_ITEMS = 3;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ skill: string }>;
}): Promise<Metadata> {
  const { skill: skillSlug } = await params;
  const { skill } = await getJobsBySkill(skillSlug);
  const label = skill || deslugify(skillSlug);
  const title = label + ' Jobs in Nepal';
  const description =
    'Browse ' + label + ' roles across Nepal. Curated from top job boards and updated daily.';
  return {
    title,
    description,
    alternates: { canonical: '/jobs/skills/' + skillSlug },
    openGraph: {
      title,
      description,
      type: 'website',
      url: SITE_URL + '/jobs/skills/' + skillSlug,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill: skillSlug } = await params;
  const { skill, jobs } = await getJobsBySkill(skillSlug);
  if (!skill) notFound();
  const canonical = slugify(skill);
  if (canonical !== skillSlug) redirect('/jobs/skills/' + canonical);
  if (jobs.length < MIN_ITEMS) notFound();

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Jobs', url: SITE_URL + '/jobs' },
    { name: skill + ' Jobs' },
  ]);

  return (
    <Layout>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="w">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/jobs">Jobs</Link>
          <span>/</span>
          <span>{skill}</span>
        </nav>

        <PageHeader
          eyebrow={'Skill · ' + jobs.length + ' open'}
          title={skill + ' jobs in Nepal.'}
          description={'Roles requiring ' + skill + ', curated from Nepal\'s top job boards.'}
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
