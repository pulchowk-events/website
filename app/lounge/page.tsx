import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SortDensityBar } from "@/app/components/lounge/SortDensityBar";
import { LoungeFeed } from "@/app/components/lounge/LoungeFeed";
import { getLoungeFeed } from "@/app/lib/queries";
import { SITE_URL } from "@/app/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lounge",
  description: "Community discussions, opportunities, and showcases from students across Nepal.",
  alternates: { canonical: "/lounge" },
  openGraph: {
    title: "Lounge — Pulchowk Events",
    description: "Community discussions from students across Nepal.",
    type: "website",
    url: SITE_URL + "/lounge",
  },
};

const PAGE_SIZE = 20;

export default async function LoungePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; sort?: string; density?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.cat || "all";
  const sort: "latest" | "top" = sp.sort === "top" ? "top" : "latest";
  const density: "comfortable" | "compact" = sp.density === "compact" ? "compact" : "comfortable";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const session = await getServerSession(authOptions);
  const { posts, totalCount, myVotes, savedIds } = await getLoungeFeed({
    category,
    sort,
    page,
    pageSize: PAGE_SIZE,
    userId: session?.user?.id,
  });

  return (
    <Layout railContext="lounge">
      <div id="portal-root" />
      <PageHeader
        title="Lounge"
      />
      <SortDensityBar sort={sort} density={density} category={category} />
      <LoungeFeed
        initialPosts={posts}
        totalCount={totalCount}
        myVotes={myVotes}
        savedIds={savedIds}
        category={category}
        sort={sort}
        density={density}
        page={page}
        pageSize={PAGE_SIZE}
        userId={session?.user?.id}
        isAdmin={false}
      />
    </Layout>
  );
}
