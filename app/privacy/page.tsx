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
        <p className="prose-page__meta">Last updated: 13 November 2026</p>

        <h2>Who we are and what this covers</h2>
        <p>
          Pulchowk Events is a community-run, open-source platform for campus events, jobs,
          scholarships, and student projects in Nepal. This policy explains what personal data
          we collect, why, where it is stored, and what rights you have.
        </p>
        <p>
          It covers the website and the API that serves it. It does not cover third-party
          sites you reach by clicking a listing, nor Discord or Google&rsquo;s own handling of
          your account there.
        </p>

        <h2>What we collect</h2>
        <p>
          <strong>When you sign in.</strong> We receive from your chosen provider (Discord or
          Google): your provider user ID, email address, display name, profile image URL, and
          email-verified status. We do not receive your password, phone number, contacts, or
          any data beyond the standard OAuth profile scope.
        </p>
        <p>
          <strong>When you use the platform.</strong> Content you post (lounge posts,
          comments, projects, event submissions, profile bio and name changes); actions
          (votes, saves, reports you file); preferences (sidebar collapsed state, density,
          hidden widgets); and donations (donor display name or &ldquo;Anonymous&rdquo;,
          amount, timestamp, eSewa transaction reference).
        </p>
        <p>
          We do not collect or store card numbers, wallet PINs, or bank credentials. Payment is
          handled entirely by eSewa.
        </p>
        <p>
          <strong>Automatically.</strong> A session cookie (to keep you signed in); a
          preference cookie (sidebar/density state, so the page does not flicker on load);
          Google Analytics 4 (pages viewed, approximate location derived from IP, device type,
          browser, referring source, session duration &mdash; GA4 receives a pseudonymous
          client ID, not your name or email); and server logs via Netlify (IP address, request
          path, timestamp, user agent, retained for 30 days).
        </p>
        <p>
          <strong>What we do not collect.</strong> We do not collect precise GPS location,
          contact lists, biometric data, government identifiers, or financial account numbers.
          We do not use advertising trackers, retargeting pixels, or sell data to anyone.
        </p>

        <h2>Why we use it</h2>
        <ul>
          <li><strong>Sign in.</strong> Provider ID, email, session cookie.</li>
          <li><strong>Display posts and profile.</strong> Name, image, content you post.</li>
          <li><strong>Rank projects and count votes.</strong> Votes, saves.</li>
          <li><strong>Show saved items.</strong> Saves, preferences.</li>
          <li><strong>Verify and display donations.</strong> Donor name, amount, transaction reference.</li>
          <li><strong>Understand which pages are used.</strong> GA4 analytics.</li>
          <li><strong>Detect abuse, spam, and vote manipulation.</strong> Actions, IP (in logs), timestamps.</li>
          <li><strong>Respond to legal requests.</strong> Account data, content, logs.</li>
        </ul>
        <p>
          We do not send marketing emails. There is no newsletter. If that changes, we will
          ask for separate, explicit opt-in first.
        </p>

        <h2>Consent and legal basis</h2>
        <p>
          Under Nepal&rsquo;s Privacy Act, 2075 (2018), personal data must be collected with
          the person&rsquo;s knowledge and consent, and must be destroyed within 30 days after
          the purpose for which it was collected is fulfilled (subject to legal retention
          requirements).
        </p>
        <ul>
          <li><strong>Account data</strong> is collected with your consent, given when you sign in via OAuth. The consent screen of your provider discloses the data shared.</li>
          <li><strong>Content you post</strong> is published under your instruction when you click Post, Comment, or Submit.</li>
          <li><strong>Analytics</strong> is disclosed in this policy and can be disabled by browser settings or a tracking blocker.</li>
          <li><strong>Donation data</strong> is required to verify and publish the ledger, which is the purpose of the donation feature.</li>
        </ul>
        <p>
          We do not rely on legitimate-interest processing for anything that materially affects
          you without disclosure.
        </p>

        <h2>Cookies and analytics</h2>
        <p>
          <strong>Essential cookies.</strong> A session cookie (sign-in) and a preference
          cookie (sidebar/density). These cannot be turned off without breaking the site.
        </p>
        <p>
          <strong>Analytics.</strong> Google Analytics 4. It sets <code>_ga</code> and{" "}
          <code>_ga_*</code> cookies with a default 2-year expiry. GA4 data is retained for 14
          months in Google&rsquo;s systems.
        </p>
        <p>You can opt out by:</p>
        <ul>
          <li>Blocking third-party cookies in your browser</li>
          <li>Using a tracker blocker (uBlock Origin, Brave Shields, etc.)</li>
          <li>Installing Google&rsquo;s official opt-out add-on</li>
        </ul>
        <p>
          We do not currently run a cookie consent banner, because Nepal&rsquo;s Privacy Act
          does not explicitly cover cookies or online identifiers, and we serve a primarily
          Nepali audience. If you access the platform from the EU, UK, or Switzerland, note
          that GA4 will load on first visit; if this is a concern, block it as above.
        </p>

        <h2>Who we share data with</h2>
        <p>
          We share data only with the service providers required to run the platform. Each is
          bound by its own data processing terms.
        </p>
        <ul>
          <li><strong>Supabase</strong> (AWS Mumbai, India) &mdash; primary database, authentication, file storage. All account, content, and donation records.</li>
          <li><strong>Netlify</strong> (US, global edge) &mdash; website hosting and CDN. Request metadata, IP addresses, server logs.</li>
          <li><strong>Discord</strong> (US) &mdash; OAuth sign-in. Provider profile at sign-in.</li>
          <li><strong>Google</strong> (US) &mdash; OAuth sign-in; Google Analytics 4.</li>
          <li><strong>eSewa</strong> (Nepal) &mdash; donation payment processing. Payment details you provide to eSewa.</li>
        </ul>
        <p>
          We do not sell, rent, or trade personal data. We do not share data with advertisers or
          data brokers.
        </p>
        <p>
          <strong>Legal disclosure.</strong> We will disclose data to Nepali authorities where
          legally compelled (court order, written request under the Electronic Transactions
          Act, 2063, or equivalent). Where permitted, we will notify the affected user.
        </p>

        <h2>Where your data is stored</h2>
        <p>
          Your account and content data is stored in Supabase&rsquo;s Mumbai region
          (<code>ap-south-1</code>, AWS Mumbai, India). This is the closest Supabase region to
          Nepal and is chosen for latency, not for a specific legal guarantee &mdash; Supabase
          explicitly notes that region selection is a data-location control, not proof of
          regulatory compliance.
        </p>
        <p>
          Static assets and page requests pass through Netlify&rsquo;s global CDN, which may
          process request metadata (IP, path, user agent) in any region where Netlify has an
          edge node.
        </p>
        <p>Google Analytics processes data in Google&rsquo;s global infrastructure.</p>

        <h2>How long we keep it</h2>
        <ul>
          <li><strong>Account</strong> (name, email, provider ID) &mdash; until you delete your account.</li>
          <li><strong>Content you post</strong> &mdash; until you delete it (hard-deleted immediately), or until your account is deleted.</li>
          <li><strong>Deleted account data</strong> &mdash; hard-deleted after a 30-day grace period (during which you can restore by signing in).</li>
          <li><strong>Backups</strong> &mdash; up to 30 days after deletion.</li>
          <li><strong>Server logs</strong> (Netlify) &mdash; 30 days.</li>
          <li><strong>Google Analytics</strong> &mdash; 14 months.</li>
          <li><strong>Donation records</strong> &mdash; retained indefinitely as part of the public verified ledger, because the ledger&rsquo;s integrity is the point. Donor name is shown unless you chose &ldquo;Anonymous&rdquo;.</li>
          <li><strong>Moderation records</strong> &mdash; retained while the account is active.</li>
        </ul>

        <h2>Your rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> your data. Request via email at <a href="mailto:pulchowkevents@gmail.com">pulchowkevents@gmail.com</a>.</li>
          <li><strong>Export</strong> your data in JSON format.</li>
          <li><strong>Correct</strong> your name and bio at any time in Settings.</li>
          <li><strong>Delete</strong> your account and content at any time in Settings.</li>
          <li><strong>Object</strong> to analytics by blocking cookies.</li>
          <li><strong>Complain</strong> to us first, and to the relevant authority if unresolved.</li>
        </ul>
        <p>
          We will respond to access, export, and deletion requests within 30 days.
        </p>
        <p>
          <strong>Note on deletion and the donation ledger.</strong> If you have donated and
          chose to display your name, deleting your account will not remove your donation from
          the public ledger &mdash; instead your entry will be anonymised to
          &ldquo;Anonymous&rdquo; so the totals remain accurate. This is a deliberate design
          choice to prevent the ledger from being rewritten; if you object, contact us before
          donating.
        </p>

        <h2>Security</h2>
        <p>
          We use HTTPS everywhere, server-side session handling, service-role separation for
          database access, and no client-side exposure of secrets. Supabase provides encryption
          at rest and in transit.
        </p>
        <p>
          No system is perfectly secure. If we become aware of a breach affecting your personal
          data, we will notify affected users within 72 hours of confirming the breach, and
          describe what was exposed and what you should do.
        </p>

        <h2>Children</h2>
        <p>
          We do not knowingly collect data from anyone under 13. If you believe a child under
          13 has created an account, contact us and we will delete it. Users aged 13&ndash;17
          should have a parent or guardian review this policy with them.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy. The &ldquo;Last updated&rdquo; date at the top will
          change. For material changes affecting what we collect or who we share it with, we
          will make reasonable efforts to notify registered users. Continued use after an
          update means you accept the revised policy.
        </p>

        <h2>Contact</h2>
        <p>
          Privacy questions, access requests, deletion requests, and breach reports:{" "}
          <a href="mailto:pulchowkevents@gmail.com">pulchowkevents@gmail.com</a>. We aim to
          respond within 7 days. You may also open an issue at{" "}
          <a href="https://github.com/pulchowk-events" target="_blank" rel="noopener noreferrer">
            github.com/pulchowk-events
          </a>{" "}
          with the label <code>privacy</code>.
        </p>
      </article>
    </Layout>
  );
}
