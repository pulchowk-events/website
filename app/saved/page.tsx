import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SavedClient } from "@/app/components/saved/SavedClient";
import { SavedGuestCard } from "@/app/components/saved/SavedGuestCard";
import { getSavedItemsFull } from "@/app/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved",
  description: "Events, jobs, posts, and projects you saved for later.",
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <Layout railContext="utility">
        <PageHeader title="Saved" />
        <SavedGuestCard />
      </Layout>
    );
  }

  const items = await getSavedItemsFull(session.user.id);

  return (
    <Layout railContext="utility">
      <PageHeader
        title="Saved"
        count={items.length > 0 ? items.length + (items.length === 1 ? " item" : " items") : undefined}
      />
      <SavedClient items={items} />
    </Layout>
  );
}
