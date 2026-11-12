import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import DonateClient from "@/app/components/donate/DonateClient";
import {
  getTopDonators,
  getPrizePool,
  getVerifiedDonationsLedger,
} from "@/app/lib/queries";
import { SITE_URL } from "@/app/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Fund student investing competitions and seed capital for student projects across Nepal. 100% of donations go directly to students.",
  alternates: { canonical: "/donate" },
  openGraph: {
    title: "Donate — Pulchowk Events",
    description: "100% of donations fund student competitions and awards.",
    type: "website",
    url: SITE_URL + "/donate",
  },
};

export default async function DonatePage() {
  const [donators, prizePoolData, ledger, session] = await Promise.all([
    getTopDonators(10),
    getPrizePool(),
    getVerifiedDonationsLedger(20),
    getServerSession(authOptions),
  ]);

  const prizePool = {
    current_amount: prizePoolData.currentAmount,
    target_amount: prizePoolData.targetAmount,
  };

  return (
    <Layout railContext="donate">
      <PageHeader
        title="Donate"
        description="Every dollar funds student competitions and awards. No platform fee."
      />
      <DonateClient
        session={session}
        donators={donators}
        prizePool={prizePool}
        verifiedLedger={ledger}
      />
    </Layout>
  );
}
