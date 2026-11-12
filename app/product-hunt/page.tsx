import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectRow } from "@/app/components/product/ProjectRow";
import { ProductComposer } from "@/app/components/product/ProductComposer";
import { getApprovedProducts } from "@/app/lib/queries";
import { SITE_URL } from "@/app/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: "Student-built projects from Nepal. Vote on what your peers shipped.",
  alternates: { canonical: "/product-hunt" },
  openGraph: {
    title: "Projects — Pulchowk Events",
    description: "Student-built projects from Nepal.",
    type: "website",
    url: SITE_URL + "/product-hunt",
  },
};

const TABS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "all", label: "All time" },
] as const;

type Sort = typeof TABS[number]["value"];

export default async function ProductHuntPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  const sort: Sort =
    sp.sort === "today" || sp.sort === "week" ? sp.sort : "all";

  const products = await getApprovedProducts(sort);
  const isSparse = products.length < 5;

  return (
    <Layout railContext="projects">
      <div id="portal-root" />

      <PageHeader
        title="Projects"
        actions={<Link href="/product-hunt/new" className="btn btn--primary btn--sm">Submit project</Link>}
      />

      {session?.user?.id && <ProductComposer userId={session.user.id} />}

      <div className="phead-tabs">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/product-hunt" : "/product-hunt?sort=" + t.value}
            className={"tab" + (sort === t.value ? " tab--on" : "")}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="empty-row">
          <p>No projects launched {sort === "today" ? "today" : sort === "week" ? "this week" : "yet"}.</p>
          <Link href="/product-hunt/new" className="btn btn--primary btn--sm">Submit project</Link>
        </div>
      ) : (
        <div className="plist">
          {products.map((p: any, i: number) => (
            <ProjectRow key={p.id} project={p} rank={i + 1} />
          ))}
          {isSparse && (
            <div className="plist__sparse">
              <p>Launch yours</p>
              <Link href="/product-hunt/new" className="btn btn--primary btn--sm">Submit project</Link>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
