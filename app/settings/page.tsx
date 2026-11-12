import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsClient } from "@/app/components/settings/SettingsClient";
import { SavedGuestCard } from "@/app/components/saved/SavedGuestCard";
import { readLayoutPrefs, getHiddenWidgets } from "@/app/lib/preferences.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <Layout railContext="utility">
        <PageHeader title="Settings" />
        <SavedGuestCard />
      </Layout>
    );
  }

  const [prefs, hidden] = await Promise.all([
    readLayoutPrefs(),
    getHiddenWidgets(session.user.id),
  ]);

  return (
    <Layout railContext="utility">
      <PageHeader title="Settings" />
      <SettingsClient
        userId={session.user.id}
        email={session.user.email || null}
        initialPrefs={prefs}
        initialHidden={hidden}
      />
    </Layout>
  );
}
