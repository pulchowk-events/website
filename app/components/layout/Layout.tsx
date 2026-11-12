import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AppShell } from "@/app/components/shell/AppShell";
import { getNavCounts, getRailData, type RailContext } from "@/app/lib/queries";
import { isAdmin } from "@/app/lib/isAdmin";
import { readLayoutPrefs } from "@/app/lib/preferences.server";

interface Props {
  children: ReactNode;
  railContext?: RailContext;
}

export default async function Layout({ children, railContext = "utility" }: Props) {
  const session = await getServerSession(authOptions);
  const [counts, prefs, adminFlag, rail] = await Promise.all([
    getNavCounts(session?.user?.id),
    readLayoutPrefs(),
    session?.user?.email ? isAdmin(session.user.email) : Promise.resolve(false),
    getRailData(railContext, session?.user?.id),
  ]);

  return (
    <AppShell
      counts={counts}
      isAdmin={adminFlag}
      isSignedIn={!!session?.user?.id}
      initialCollapsed={prefs.sidebarCollapsed}
      density={prefs.density}
      rail={rail}
    >
      {children}
    </AppShell>
  );
}
