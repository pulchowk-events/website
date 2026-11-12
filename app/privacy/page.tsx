import type { Metadata } from "next";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SITE_URL } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Pulchowk Events collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy Policy", type: "website", url: SITE_URL + "/privacy" },
};

export default function PrivacyPage() {
  return (
    <Layout railContext="utility">
      <PageHeader title="Privacy Policy" />
      <article className="prose-page">
        <p className="prose-page__meta">Last updated: 14 November 2026</p>

        <h2>What we collect</h2>
        <p>
          When you sign in with Discord or Google, we receive your user ID, name,
          email address, and profile image from that provider. We store these in
          our database to identify you on the site.
        </p>
        <p>
          We do not collect passwords. Authentication is handled entirely by
          Discord and Google.
        </p>

        <h2>What you post</h2>
        <p>
          Posts, comments, votes, projects, saved items, and any events or jobs
          you submit are stored in our database and visible to other users.
          Deleting a post removes it and its comments permanently.
        </p>

        <h2>How we use it</h2>
        <p>
          Your data is used to run the site: rendering your content, showing
          your name on posts, tracking votes and saves, and notifying you about
          relevant activity. We do not sell your data to anyone.
        </p>

        <h2>Cookies</h2>
        <p>
          We use cookies to keep you signed in and to remember your layout
          preferences (sidebar state, density). No third-party advertising
          cookies are set.
        </p>

        <h2>Third parties</h2>
        <ul>
          <li><strong>Supabase</strong> hosts our database.</li>
          <li><strong>Netlify</strong> hosts the site.</li>
          <li><strong>Discord</strong> and <strong>Google</strong> handle sign-in.</li>
          <li><strong>Google Analytics</strong> (if enabled) tracks aggregate usage — no personal data.</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          You can edit your name and bio in Settings or on your profile. To
          delete your account entirely, contact us on Discord — we&apos;ll remove
          your user row, posts, comments, and any donations associated with your
          email within 7 days.
        </p>

        <h2>Security</h2>
        <p>
          We use standard HTTPS, row-level access policies, and secrets that
          never leave the server. No system is perfect — if you spot a
          vulnerability, please report it on Discord rather than exploiting it.
        </p>

        <h2>Changes</h2>
        <p>
          If this policy changes in a material way, we&apos;ll announce it in the
          Discord before the change takes effect.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Reach us on <a href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener noreferrer">Discord</a>.
        </p>
      </article>
    </Layout>
  );
}
