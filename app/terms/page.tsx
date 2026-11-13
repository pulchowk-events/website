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
        <p className="prose-page__meta">Last updated: 13 November 2026</p>

        <h2>Who we are</h2>
        <p>
          Pulchowk Events (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the platform&rdquo;) is a community-run,
          open-source platform for campus events, jobs, scholarships, student projects, and
          discussion, focused on Nepal. The source code is publicly available at
          github.com/pulchowk-events. We are not a registered company; we operate as a
          community project.
        </p>
        <p>
          These Terms are a legal agreement between you and Pulchowk Events. By using the
          platform you accept them. If you do not accept them, do not use the platform.
        </p>

        <h2>Eligibility</h2>
        <p>
          You must be <strong>at least 13 years old</strong> to create an account or post
          content. If you are between 13 and 18, you confirm that a parent or guardian has
          reviewed these Terms with you. We do not knowingly collect data from anyone under
          13; if we learn we have, we will delete the account.
        </p>
        <p>
          You may browse the platform without an account. Creating an account is required
          only to post, comment, vote, save items, or donate.
        </p>

        <h2>Your account</h2>
        <p>
          <strong>Sign-in.</strong> Accounts are created through Discord or Google OAuth. We
          receive your provider user ID, email address, and display name. You do not set a
          password with us.
        </p>
        <p>
          <strong>Names.</strong> You may use your real name or a pseudonym. You may not
          impersonate another person, a company, or a platform administrator.
        </p>
        <p>
          <strong>One account per person.</strong> Creating multiple accounts to evade a
          ban, inflate votes, or manipulate rankings is prohibited and will result in removal
          of all accounts.
        </p>
        <p>
          <strong>Security.</strong> You are responsible for the security of your Discord and
          Google accounts. Notify us immediately if you believe your Pulchowk Events account
          has been accessed without your permission.
        </p>
        <p>
          <strong>Deletion.</strong> You can delete your account at any time from Settings.
          Deletion is self-serve and immediate. See the &ldquo;Content you post&rdquo; section
          for what happens to content you have posted.
        </p>

        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Post content that is unlawful under Nepali law, defamatory, fraudulent, or that infringes another person&rsquo;s intellectual property;</li>
          <li>Post hate speech, harassment, threats, or content that incites violence against any person or group;</li>
          <li>Post political or religious advocacy or campaigning of any kind;</li>
          <li>Post commercial promotion, advertising, affiliate links, or referral spam, other than describing your own project in the Projects section;</li>
          <li>Post another person&rsquo;s private information (doxxing) &mdash; including phone numbers, addresses, government IDs, or private messages &mdash; without their consent;</li>
          <li>Post sexual content involving minors, or any content that sexualises a minor;</li>
          <li>Upload malware, attempt to gain unauthorised access to the platform, scrape the platform at scale, or interfere with its operation;</li>
          <li>Manipulate votes, saves, comment counts, or rankings, including through alt accounts, coordinated voting, or automation;</li>
          <li>Circumvent rate limits, cooldowns, or moderation actions;</li>
          <li>Use the platform to send unsolicited bulk messages.</li>
        </ul>

        <h2>Content you post</h2>
        <p>
          <strong>You own your content.</strong> You retain full copyright in everything you
          post &mdash; lounge posts, comments, projects, event submissions. We do not claim
          ownership.
        </p>
        <p>
          <strong>The licence you give us.</strong> By posting, you grant Pulchowk Events a
          non-exclusive, worldwide, royalty-free, perpetual licence to store, display,
          reproduce, and distribute your content on the platform and in promotional material
          for the platform. This licence survives deletion of the content for the limited
          purpose of backups and cached copies, but we will stop displaying it publicly on
          deletion.
        </p>
        <p>
          This licence does not apply to third-party content that appears on the platform
          through our automated scraping. We claim no rights in that content.
        </p>
        <p>
          <strong>Deletion.</strong> When you delete a post, comment, or project, it is
          hard-deleted from our production database immediately. It may persist in encrypted
          backups for up to 30 days and in third-party caches we do not control (search
          engines, archive services) for longer. We cannot retrieve or restore deleted
          content.
        </p>
        <p>
          <strong>Responsibility.</strong> You are solely responsible for what you post. You
          confirm you have the right to post it and that it does not violate the Acceptable
          use section or any law.
        </p>

        <h2>Third-party listings (events, jobs, scholarships)</h2>
        <p>
          <strong>What these are.</strong> Events, jobs, and scholarship listings are
          collected automatically from public sources including Khalti, KataJaam, NepVents,
          Kgarira, SathiJob, InternSathi, MeroJob, KumariJob, ScholarshipsAds, and Erasmus
          Mundus. These listings are not created, reviewed, or endorsed by us.
        </p>
        <p>
          <strong>Attribution.</strong> Where the source is known, we display it (&ldquo;via
          KataJaam&rdquo;, &ldquo;Erasmus Mundus&rdquo;) on the listing and always link to the
          original source on the detail page.
        </p>
        <p>
          <strong>Accuracy.</strong> We make best-effort attempts to keep listings accurate,
          but we do not guarantee that any listing is current, complete, or correct.
          Deadlines change, roles get filled, events get cancelled. Always verify on the
          original source before applying, registering, or travelling.
        </p>
        <p>
          <strong>Rights in scraped content.</strong> All rights in scraped listings remain
          with the original publisher or author. We assert that collecting publicly available
          factual information (title, date, company, deadline, link) is lawful, and our
          crawler respects robots.txt and rate limits. If you are a rights-holder and believe
          we have reproduced protected material (for example, a substantial portion of a
          database or original prose), contact us and we will remove or reduce it.
        </p>
        <p>
          <strong>Removal requests.</strong> If you operate a source site and want your
          listings removed, contact us. We will action clear, good-faith requests within{" "}
          <strong>7 days</strong>, and immediately where the law requires it.
        </p>

        <h2>Jobs and scholarships &mdash; no agency relationship</h2>
        <p>
          We are a discovery platform only. We do not employ, recruit, screen, or represent
          any employer, university, or scholarship provider. Applications are made on the
          original third-party site; we are not a party to any application, employment,
          admission, or funding relationship.
        </p>
        <p>
          We do not charge for job listings, and we do not accept payment from employers or
          institutions for placement.
        </p>

        <h2>Projects and the Lounge</h2>
        <p>
          Projects are submitted by users and are visible after automated checks. Lounge
          posts and comments are user-generated and visible immediately.
        </p>
        <p>
          You must not post a project you did not build or contribute to. You must not post a
          lounge entry that misrepresents a fact as verified when it is not.
        </p>

        <h2>Donations</h2>
        <p>
          <strong>What donations pay for.</strong> Donations are used first to cover the
          platform&rsquo;s operating costs &mdash; hosting, database, and server expenses.
          Any remaining funds go to student competition prizes and merit-based awards. If
          additional spending on platform improvements becomes necessary, those costs will be
          publicly disclosed on the Donate page before they are incurred.
        </p>
        <p>
          <strong>Transparency.</strong> The current prize pool, verified donation total, and
          donor ledger are published on the Donate page. Costs drawn from the pool are
          disclosed there as they are incurred.
        </p>
        <p>
          <strong>Payment.</strong> Donations are processed through eSewa (and other Nepali
          digital wallets where supported). We do not store your payment credentials.
          eSewa&rsquo;s own terms and privacy policy apply to the transaction itself.
        </p>
        <p>
          <strong>Refunds.</strong> You may request a refund within 7 days of donating,
          provided the prize to which your donation was allocated has not yet been awarded.
          After a prize is awarded, donations are non-refundable. To request a refund, contact
          us with your transaction reference; refunds are processed to the originating eSewa
          wallet.
        </p>
        <p>
          <strong>Tax.</strong> We do not provide tax receipts. Donations are not
          tax-deductible unless we state otherwise in writing.
        </p>
        <p>
          <strong>Fraud.</strong> Fraudulent donations, chargebacks, or attempts to
          manipulate the donor leaderboard will result in removal from the ledger and, where
          relevant, account termination.
        </p>

        <h2>Moderation and enforcement</h2>
        <p>
          <strong>Reactive moderation.</strong> We do not pre-screen user content. We act on
          reports and on our own observation.
        </p>
        <p>
          <strong>What we may do.</strong> We may, at our discretion: remove content, hide a
          listing, restrict an account, suspend an account, or terminate an account. For
          serious violations (illegal content, CSAM, threats of violence, fraud), we may act
          immediately without notice.
        </p>
        <p>
          <strong>Appeals.</strong> If you believe a moderation action was wrong, open an
          issue on our GitHub repository with the relevant post or account reference. We will
          review.
        </p>
        <p>
          <strong>Cooperation with authorities.</strong> We will disclose account information
          to Nepali law enforcement where we are legally compelled to do so.
        </p>

        <h2>Our intellectual property</h2>
        <p>
          The platform&rsquo;s code is open source under its repository licence. The
          &ldquo;Pulchowk Events&rdquo; name, logo, and visual design are ours; you may not
          use them to imply endorsement without permission. Scraped third-party listings
          remain the property of their publishers.
        </p>

        <h2>Third-party services</h2>
        <p>
          The platform depends on services we do not control: Discord and Google (sign-in),
          Supabase (database and storage), Netlify (hosting), and Google Analytics (usage
          measurement). Outages, policy changes, or errors in these services may affect the
          platform. Their own terms apply to your use of them.
        </p>

        <h2>Disclaimers</h2>
        <p>
          The platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
          warranties of any kind, express or implied, including merchantability, fitness for a
          particular purpose, accuracy, and non-infringement. We do not warrant that the
          service will be uninterrupted, error-free, or secure, or that any listing is
          accurate or still open.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by Nepali law, Pulchowk Events and its contributors
          are not liable for any indirect, incidental, special, consequential, or punitive
          damages, or for any loss of data, opportunity, employment, admission, funding, or
          profits, arising from your use of the platform or reliance on any listing.
        </p>
        <p>
          Our total aggregate liability for any claim arising out of these Terms or the
          platform is zero, because the service is provided free of charge.
        </p>
        <p>
          Nothing in this section excludes liability that cannot lawfully be excluded under
          Nepali law.
        </p>

        <h2>Indemnity</h2>
        <p>
          You agree to indemnify Pulchowk Events and its contributors against any claim, loss,
          or expense (including reasonable legal fees) arising from: (a) content you post;
          (b) your breach of these Terms; or (c) your violation of any law or third-party
          right.
        </p>

        <h2>Changes to the service and to these Terms</h2>
        <p>
          We may change, suspend, or discontinue any part of the platform at any time.
        </p>
        <p>
          We may update these Terms at any time. Updated Terms take effect when posted on this
          page with a new &ldquo;Last updated&rdquo; date. Continued use after posting
          constitutes acceptance. For material changes, we will make reasonable efforts to
          notify registered users, but notification is a courtesy, not a condition of
          effectiveness. If you do not accept a change, stop using the platform.
        </p>

        <h2>Termination</h2>
        <p>
          You may stop using the platform and delete your account at any time. We may suspend
          or terminate your access at any time for breach of these Terms or for conduct that
          we reasonably believe harms the platform or its users. The sections on licence,
          scraped content rights, disclaimers, limitation of liability, indemnity, governing
          law, and contact survive termination.
        </p>

        <h2>Governing law and disputes</h2>
        <p>
          These Terms are governed by the laws of Nepal.
        </p>
        <p>
          <strong>Informal resolution first.</strong> Before starting formal proceedings,
          contact us and describe the dispute. We will try to resolve it within 30 days.
        </p>
        <p>
          <strong>Courts.</strong> If informal resolution fails, disputes are subject to the
          exclusive jurisdiction of the courts of Kathmandu, Nepal.
        </p>
        <p>
          <strong>Individual basis.</strong> You agree to bring claims only in your individual
          capacity, not as part of any class, collective, or representative action. (Nepal
          does not currently provide a class-action mechanism for consumer claims, so this
          clause is largely confirmatory rather than restrictive.)
        </p>
        <p>
          <strong>Arbitration.</strong> We do not require arbitration. Either party may
          propose arbitration under the Arbitration Act, 2055 (1999) as an alternative to
          litigation, but neither party is obliged to accept.
        </p>

        <h2>General</h2>
        <p>
          If any provision is found unenforceable, the rest remains in force. Our failure to
          enforce a provision is not a waiver. You may not assign your rights under these
          Terms; we may assign ours to a successor. These Terms, together with the Privacy
          Policy, are the entire agreement between you and us regarding the platform.
        </p>

        <h2>Contact</h2>
        <p>
          Legal and takedown enquiries:{" "}
          <a href="mailto:pulchowkevents@gmail.com">pulchowkevents@gmail.com</a>. We aim to
          respond within 7 days. You may also open an issue at{" "}
          <a href="https://github.com/pulchowk-events" target="_blank" rel="noopener noreferrer">
            github.com/pulchowk-events
          </a>{" "}
          with the label <code>legal</code>.
        </p>
      </article>
    </Layout>
  );
}
