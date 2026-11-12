import type { Metadata } from "next";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SITE_URL } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for using Pulchowk Events.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms of Service", type: "website", url: SITE_URL + "/terms" },
};

export default function TermsPage() {
  return (
    <Layout railContext="utility">
      <PageHeader title="Terms of Service" />
      <article className="prose-page">
        <p className="prose-page__meta">Last updated: 14 November 2026</p>

        <h2>Acceptance</h2>
        <p>
          By accessing or using Pulchowk Events, you agree to these terms. If you
          don&apos;t agree, don&apos;t use the site.
        </p>

        <h2>Who can use it</h2>
        <p>
          Anyone can browse. To post, vote, save, comment, or submit events and
          projects, you must sign in with Discord or Google and be at least 13
          years old.
        </p>

        <h2>Your content</h2>
        <p>
          You retain ownership of what you post. By submitting content, you grant
          Pulchowk Events a non-exclusive, worldwide license to display, cache,
          and distribute it on the site and in our Discord for as long as it
          remains published.
        </p>
        <p>
          You are responsible for your content. Do not post anything unlawful,
          misleading, harassing, or that infringes someone else&apos;s rights.
        </p>

        <h2>Moderation</h2>
        <p>
          Admins may approve, reject, edit, or delete content at any time. Content
          that violates these terms or the community guidelines is removed without
          notice. Repeated violations can lead to a permanent ban.
        </p>

        <h2>Scraped listings</h2>
        <p>
          Some events and jobs are scraped from public sources (Khalti, KataJaam,
          NepVents, Kgarira, Merojob, KumariJob, SathiJob, InternSathi). Each
          listing links to the original. We make no warranty about the accuracy
          of third-party listings. Always verify details with the original poster
          before registering or applying.
        </p>

        <h2>Donations</h2>
        <p>
          Donations fund the student prize pool. They are verified manually and
          are non-refundable once verified. If a mistake happens, contact us on
          Discord and we&apos;ll sort it out.
        </p>

        <h2>No warranty</h2>
        <p>
          The site is provided &ldquo;as is.&rdquo; We make no guarantees about
          uptime, accuracy, or fitness for a particular purpose. Use at your own
          risk.
        </p>

        <h2>Changes</h2>
        <p>
          These terms may be updated at any time. Continued use after a change
          means you accept the new terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Reach us on <a href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener noreferrer">Discord</a>.
        </p>
      </article>
    </Layout>
  );
}
