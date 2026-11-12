import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductComposer } from "@/app/components/product/ProductComposer";

export const metadata: Metadata = {
  title: "New project",
  robots: { index: false, follow: false },
};

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/product-hunt");

  return (
    <Layout railContext="projects">
      <PageHeader title="New project" description="Projects go through review before appearing on the leaderboard." />
      <ProductComposer userId={session.user.id} fullPage />
    </Layout>
  );
}
