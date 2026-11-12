import type { Metadata } from "next";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { HelpClient } from "@/app/components/help/HelpClient";
import { SITE_URL } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Answers to common questions about Pulchowk Events — accounts, events, jobs, projects, donations, and moderation.",
  alternates: { canonical: "/help" },
  openGraph: {
    title: "Help — Pulchowk Events",
    description: "Answers to common questions about Pulchowk Events.",
    type: "website",
    url: SITE_URL + "/help",
  },
};

export default function HelpPage() {
  return (
    <Layout railContext="utility">
      <PageHeader
        title="Help"
        description="Answers to common questions. Search below or browse by topic."
      />
      <HelpClient />
    </Layout>
  );
}
