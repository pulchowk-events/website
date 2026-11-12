import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/auth";
import { isAdmin } from "@/app/lib/isAdmin";
import { AdminShell } from "@/app/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) notFound();

  const admin = await isAdmin(session.user.email);
  if (!admin) notFound();

  return (
    <AdminShell
      session={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    >
      {children}
    </AdminShell>
  );
}
