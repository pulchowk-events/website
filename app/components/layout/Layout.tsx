import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AppShell } from "@/app/components/shell/AppShell";
import { getNavCounts } from "@/app/lib/queries";
import { isAdmin } from "@/app/lib/isAdmin";
import { readLayoutPrefs } from "@/app/lib/preferences";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const [counts, prefs, adminFlag] = await Promise.all([
    getNavCounts(session?.user?.id),
    readLayoutPrefs(),
    session?.user?.email ? isAdmin(session.user.email) : Promise.resolve(false),
  ]);

  return (
    <AppShell
      counts={counts}
      isAdmin={adminFlag}
      isSignedIn={!!session?.user?.id}
      initialCollapsed={prefs.sidebarCollapsed}
      density={prefs.density}
    >
      {children}
    </AppShell>
  );
}
