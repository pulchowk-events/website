import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Layout from '@/app/components/layout/Layout';
import { FaqInteractions } from '@/app/components/faq/FaqInteractions';
import { FaqNumbers } from '@/app/components/faq/FaqNumbers';
import { getAboutStats } from '@/app/lib/queries';
import { SITE_URL } from '@/app/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about Pulchowk Events — eligibility, accounts, submitting events and projects, and where donations go.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — Pulchowk Events',
    description:
      'Answers to common questions about eligibility, accounts, submitting events, and donations.',
    type: 'website',
    url: SITE_URL + '/faq',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ — Pulchowk Events',
    description:
      'Answers to common questions about eligibility, accounts, submitting events, and donations.',
  },
};

const DISCORD_URL = 'https://discord.gg/cQ5gxusATk';

const FAQS = [
  {
    q: 'Is this only for Pulchowk students?',
    a: 'No. Most events are open to everyone. A smaller set are exclusive to Pulchowk students — usually because they are held on campus or have limited seats — and every one is labelled so you always know what you are signing up for.',
  },
  {
    q: 'Do I need an account to browse?',
    a: 'No. You can browse events, jobs, projects, and the lounge without signing in. An account is only required to submit a project, vote, post in the lounge, or enroll a club.',
  },
  {
    q: 'How do I submit an event or project?',
    a: 'Sign in, then use the Add button on the events or product-hunt page. Submissions go into a review queue and are typically approved within a day.',
  },
  {
    q: 'Where does the prize pool go?',
    a: 'One hundred percent of donations funds the prize pool for our student competitions and merit-based awards. No platform fee is taken — every dollar reaches students.',
  },
];

export default async function FaqPage() {
  const stats = await getAboutStats();

  const numbers = [
    { value: 11000, suffix: '+', label: 'Students reached' },
    { value: 101, suffix: '+', label: 'Campus communities' },
    { value: stats.totalEvents, label: 'Events indexed' },
    { value: stats.totalProducts, label: 'Projects showcased' },
  ];

  return (
    <Layout>
      <FaqInteractions />

      <section className="faq-hero">
        <div className="w">
          <p className="faq-hero__eyebrow">
            <span className="faq-hero__dot" aria-hidden="true" />
            FAQ
          </p>
          <h1 className="faq-hero__title">Questions, answered.</h1>
          <p className="faq-hero__sub">
            Everything you need to know about Pulchowk Events. If something
            isn&apos;t here, ask in the Discord.
          </p>
        </div>
      </section>

      <section className="faq-section" data-reveal>
        <div className="w">
          <FaqNumbers numbers={numbers} />
        </div>
      </section>

      <section className="faq-section" data-reveal>
        <div className="w">
          <div className="faq-accordion">
            {FAQS.map((faq) => (
              <details key={faq.q} className="faq-accordion__item">
                <summary>
                  <span>{faq.q}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section faq-cta" data-reveal>
        <div className="w faq-cta__inner">
          <h2 className="faq-cta__title">Still curious?</h2>
          <p className="faq-cta__sub">
            Ask in the Discord. Eleven thousand students, mostly happy to help.
          </p>
          <div className="faq-cta__actions">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              <span className="btn__label">
                Join Discord
                <ArrowRight size={14} style={{ marginLeft: 8 }} />
              </span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                Join Discord
                <ArrowRight size={14} style={{ marginLeft: 8 }} />
              </span>
            </a>
            <Link href="/events" className="btn btn--secondary">
              <span className="btn__label">Browse events</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                Browse events
              </span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
EOFcat > app/faq/page.tsx << 'EOF'
