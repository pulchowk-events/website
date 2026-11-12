import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoungeComposer } from "@/app/components/lounge/LoungeComposer";

export const metadata: Metadata = {
  title: "New post — Lounge",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/lounge");

  return (
    <Layout railContext="lounge">
      <PageHeader title="New post" />
      <LoungeComposer userId={session.user.id} fullPage />
    </Layout>
  );
}
