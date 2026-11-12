import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import JobDetail from "@/app/components/jobs/JobDetail";
import JsonLd from "@/app/components/seo/JsonLd";
import { getJobById, getSavedIds, getSimilarJobs } from "@/app/lib/queries";
import { SITE_URL, breadcrumbSchema } from "@/app/lib/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!id) return { title: "Job Not Found" };
  const job = await getJobById(id);
  if (!job) return { title: "Job Not Found" };

  const description = (job.description || "").slice(0, 160).replace(/\\s+/g, " ").trim();
  const title = job.title + " at " + job.company;
  const fallback =
    job.title + " role at " + job.company +
    (job.location ? " in " + job.location : "") + ". Apply on Pulchowk Events.";

  return {
    title,
    description: description || fallback,
    alternates: { canonical: "/jobs/" + id },
    openGraph: {
      title,
      description: description || fallback,
      type: "article",
      url: "/jobs/" + id,
      images: job.image_url ? [job.image_url] : [],
    },
    twitter: {
      card: "summary",
      title,
      description: description || fallback,
      images: job.image_url ? [job.image_url] : [],
    },
  };
}

function mapEmploymentType(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const s = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (s.includes("full")) return "FULL_TIME";
  if (s.includes("part")) return "PART_TIME";
  if (s.includes("intern")) return "INTERN";
  if (s.includes("contract")) return "CONTRACTOR";
  if (s.includes("freelance")) return "CONTRACTOR";
  if (s.includes("temporary") || s.includes("temp")) return "TEMPORARY";
  if (s.includes("volunteer")) return "VOLUNTEER";
  return "OTHER";
}

export default async function JobPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();

  const job = await getJobById(id);
  if (!job) notFound();

  const session = await getServerSession(authOptions);
  const [saves, similarJobs] = await Promise.all([
    getSavedIds(session?.user?.id, "job"),
    getSimilarJobs(id, job.employment_type, 4),
  ]);

  const jobJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: (job.description || "").slice(0, 3000),
    datePosted: job.posted_at || new Date().toISOString(),
    ...(job.application_ends_at && { validThrough: job.application_ends_at }),
    employmentType: mapEmploymentType(job.employment_type),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      ...(job.image_url && { logo: job.image_url }),
    },
    ...(job.location && {
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.location.split(",")[0].trim(),
          addressCountry: "NP",
        },
      },
    }),
    ...(job.attendance_mode?.toLowerCase().includes("remote") && {
      jobLocationType: "TELECOMMUTE",
    }),
    ...(job.skills && job.skills.length > 0 && { skills: job.skills.join(", ") }),
    directApply: false,
    url: SITE_URL + "/jobs/" + job.id,
  };

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Jobs", url: SITE_URL + "/jobs" },
    { name: job.title + " at " + job.company },
  ]);

  return (
    <Layout railContext="jobs">
      <JsonLd data={jobJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JobDetail job={job} isSaved={saves.has(id)} similarJobs={similarJobs} />
    </Layout>
  );
}
