import type { Metadata } from "next";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScholarshipFilterBar } from "@/app/components/scholarships/ScholarshipFilterBar";
import { ScholarshipsClient } from "@/app/components/scholarships/ScholarshipsClient";
import { getScholarshipsPage } from "@/app/lib/queries";

export const revalidate = 60;

const PAGE_SIZE = 24;

interface SearchParams {
  q?: string;
  degree?: string;
  country?: string;
  status?: string;
  sort?: string;
  page?: string;
}

function parseParams(sp: SearchParams) {
  return {
    q: (sp.q || "").trim(),
    degree: sp.degree || "any",
    country: sp.country || "any",
    status: sp.status || "any",
    sort: (sp.sort === "closing" ? "closing" : "new") as "new" | "closing",
    page: Math.max(1, parseInt(sp.page || "1", 10) || 1),
  };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const sp = await searchParams;
  const params = parseParams(sp);
  const parts: string[] = [];
  if (params.degree !== "any") parts.push(params.degree);
  parts.push("Scholarships");
  if (params.country !== "any") parts.push("for " + params.country);
  if (params.page > 1) parts.push("Page " + params.page);
  return {
    title: parts.join(" \u2014 "),
    description:
      "Fully and partially funded scholarships for Nepali students \u2014 Bachelor, Masters, PhD, and fellowships from around the world.",
    alternates: { canonical: "/scholarships" },
  };
}

export default async function ScholarshipsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const params = parseParams(sp);

  const { scholarships, totalCount } = await getScholarshipsPage({
    ...params,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <Layout railContext="utility">
      <PageHeader title="Scholarships" />
      <ScholarshipFilterBar />
      <ScholarshipsClient scholarships={scholarships} page={params.page} totalPages={totalPages} />
    </Layout>
  );
}
