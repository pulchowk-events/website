import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import JsonLd from "@/app/components/seo/JsonLd";
import { ScholarshipDetail } from "@/app/components/scholarships/ScholarshipDetail";
import { getScholarshipById, getSavedIds } from "@/app/lib/queries";
import { SITE_URL, breadcrumbSchema } from "@/app/lib/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!id) return { title: "Scholarship Not Found" };
  const s = await getScholarshipById(id);
  if (!s) return { title: "Scholarship Not Found" };

  const description = (s.description || "").slice(0, 160).replace(/\s+/g, " ").trim();
  const title = s.title + (s.provider ? " \u2014 " + s.provider : "");
  const fallback =
    s.title +
    (s.provider ? " from " + s.provider : "") +
    " \u2014 scholarship on Pulchowk Events.";

  return {
    title,
    description: description || fallback,
    alternates: { canonical: "/scholarships/" + id },
    openGraph: {
      title,
      description: description || fallback,
      type: "article",
      url: "/scholarships/" + id,
      images: s.image_url ? [s.image_url] : [],
    },
    twitter: {
      card: "summary",
      title,
      description: description || fallback,
      images: s.image_url ? [s.image_url] : [],
    },
  };
}

export default async function ScholarshipPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();
  const s = await getScholarshipById(id);
  if (!s) notFound();

  const session = await getServerSession(authOptions);
  const saves = await getSavedIds(session?.user?.id, "scholarship");

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: s.title,
    description: (s.description || "").slice(0, 3000),
    ...(s.provider && { provider: { "@type": "Organization", name: s.provider } }),
    ...(s.apply_url && { url: s.apply_url }),
    ...(s.image_url && { image: s.image_url }),
    ...(s.posted_at && { datePosted: s.posted_at }),
    ...(s.deadline_parsed && { applicationDeadline: s.deadline_parsed }),
  };

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Scholarships", url: SITE_URL + "/scholarships" },
    { name: s.title },
  ]);

  return (
    <Layout railContext="utility">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ScholarshipDetail scholarship={s} isSaved={saves.has(id)} />
    </Layout>
  );
}
