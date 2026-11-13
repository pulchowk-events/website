import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/app/components/layout/Layout";
import JsonLd from "@/app/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScholarshipRow } from "@/app/components/scholarships/ScholarshipRow";
import { getScholarshipsByLevel } from "@/app/lib/queries";
import { SITE_URL, breadcrumbSchema } from "@/app/lib/seo";

export const revalidate = 60;
export const dynamicParams = true;

const MIN_ITEMS = 3;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level: levelSlug } = await params;
  const { level } = await getScholarshipsByLevel(levelSlug);
  const label = level?.label || levelSlug;
  const title = label + " Scholarships";
  const description =
    "Funded " + label.toLowerCase() + " scholarships for Nepali students, from around the world. Updated daily.";
  return {
    title,
    description,
    alternates: { canonical: "/scholarships/level/" + levelSlug },
    openGraph: { title, description, type: "website", url: SITE_URL + "/scholarships/level/" + levelSlug },
    twitter: { card: "summary", title, description },
  };
}

export default async function ScholarshipLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: levelSlug } = await params;
  const { level, scholarships } = await getScholarshipsByLevel(levelSlug);
  if (!level || scholarships.length < MIN_ITEMS) notFound();

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Scholarships", url: SITE_URL + "/scholarships" },
    { name: level.label + " Scholarships" },
  ]);

  return (
    <Layout railContext="utility">
      <JsonLd data={breadcrumbJsonLd} />
      <PageHeader
        title={level.label + " Scholarships"}
      />
      <div className="row-list">
        {scholarships.map((s) => (
          <ScholarshipRow key={s.id} scholarship={s} showSave={false} />
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <Link href="/scholarships" className="btn btn--secondary">
          Browse all scholarships
        </Link>
      </div>
    </Layout>
  );
}
