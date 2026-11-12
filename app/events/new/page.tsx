import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventComposer } from "@/app/components/events/EventComposer";

export const metadata: Metadata = {
  title: "New event",
  robots: { index: false, follow: false },
};

export default async function NewEventPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/events");

  return (
    <Layout railContext="events">
      <PageHeader title="New event" description="Submitted events go through review before appearing on the calendar." />
      <EventComposer userId={session.user.id} fullPage />
    </Layout>
  );
}
