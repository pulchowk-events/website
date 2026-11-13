import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/app/components/layout/Layout";
import JsonLd from "@/app/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScholarshipRow } from "@/app/components/scholarships/ScholarshipRow";
import { getScholarshipsByCountry } from "@/app/lib/queries";
import { SITE_URL, breadcrumbSchema, slugify } from "@/app/lib/seo";

export const revalidate = 60;
export const dynamicParams = true;

const MIN_ITEMS = 3;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country: countrySlug } = await params;
  const { country } = await getScholarshipsByCountry(countrySlug);
  const label = country || countrySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const title = "Scholarships in " + label;
  const description =
    "Fully and partially funded scholarships in " + label + " for Nepali students. Bachelor, Masters, PhD, and fellowships.";
  return {
    title,
    description,
    alternates: { canonical: "/scholarships/country/" + countrySlug },
    openGraph: { title, description, type: "website", url: SITE_URL + "/scholarships/country/" + countrySlug },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ScholarshipCountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: countrySlug } = await params;
  const { country, scholarships } = await getScholarshipsByCountry(countrySlug);
  if (!country || scholarships.length < MIN_ITEMS) notFound();

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Scholarships", url: SITE_URL + "/scholarships" },
    { name: country + " Scholarships" },
  ]);

  return (
    <Layout railContext="utility">
      <JsonLd data={breadcrumbJsonLd} />
      <PageHeader
        title={"Scholarships in " + country}
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
