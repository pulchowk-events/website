import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Briefcase,
  Package,
  MessageCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Layout from '@/app/components/layout/Layout';
import { AboutInteractions } from '@/app/components/about/AboutInteractions';
import { AboutNumbers } from '@/app/components/about/AboutNumbers';
import { getAboutStats } from '@/app/lib/queries';
import { SITE_URL } from '@/app/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'About — Built by students, open to everyone',
  description:
    'Pulchowk Events is a student-run platform for discovering campus events, jobs, and student projects across Nepal. Free, open source, and open to every campus.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Pulchowk Events',
    description:
      'A student-run platform for discovering campus events and showcasing student projects across Nepal.',
    type: 'website',
    url: SITE_URL + '/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Pulchowk Events',
    description:
      'A student-run platform for discovering campus events and showcasing student projects across Nepal.',
  },
};

const DISCORD_URL = 'https://discord.gg/cQ5gxusATk';
const CLUB_FORM_URL = 'https://forms.gle/gjburXWczani9S6y7';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Events',
    description:
      'Hackathons, workshops, concerts, talks. Verified, deduplicated, filtered by category, city, or month.',
    href: '/events',
    cta: 'Browse events',
    tone: 'var(--g)',
  },
  {
    icon: Briefcase,
    title: 'Jobs',
    description:
      'Engineering roles and internships from Nepal’s top employers, structured for Google Jobs.',
    href: '/jobs',
    cta: 'Browse jobs',
    tone: 'var(--a)',
  },
  {
    icon: Package,
    title: 'Product Hunt',
    description:
      'Student-built projects ranked by the community. Vote, comment, and get yours on the leaderboard.',
    href: '/product-hunt',
    cta: 'See projects',
    tone: 'var(--v)',
  },
  {
    icon: MessageCircle,
    title: 'Lounge',
    description:
      'Threads, tips, and showcases. A community feed built for students, not a general purpose forum.',
    href: '/lounge',
    cta: 'Open the lounge',
    tone: 'var(--c)',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Sign in',
    description:
      'Discord or Google. One click, no passwords, no profile to fill in.',
  },
  {
    n: '02',
    title: 'Explore or contribute',
    description:
      'Browse, vote, comment, or submit your own. Every action is one click away from the page you are on.',
  },
  {
    n: '03',
    title: 'Stay in the loop',
    description:
      'Follow the Discord channels for what you actually care about. No spam, no daily digest emails.',
  },
];

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

export default async function AboutPage() {
  const stats = await getAboutStats();

  const numbers = [
    { value: 11000, suffix: '+', label: 'Students reached' },
    { value: 101, suffix: '+', label: 'Campus communities' },
    { value: stats.totalEvents, label: 'Events indexed' },
    { value: stats.totalProducts, label: 'Projects showcased' },
  ];

  return (
    <Layout>
      <AboutInteractions />

      {/* Hero */}
      <section className="about-hero">
        <div className="w">
          <p className="about-hero__eyebrow">
            <span className="about-hero__dot" aria-hidden="true" />
            About
          </p>
          <h1 className="about-hero__title">
            Built by students.
            <br />
            Open to everyone.
          </h1>
          <p className="about-hero__sub">
            A single place for the events, projects, and people that make Nepali
            engineering what it is.
          </p>
          <div className="about-hero__actions">
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

      {/* Manifesto */}
      <section className="about-section" data-reveal>
        <div className="w about-manifesto">
          <p className="about-manifesto__eyebrow">Why we exist</p>
          <div className="about-manifesto__body">
            <p>
              Campus life happens in a dozen places. A poster on a noticeboard, a
              Slack message, an Instagram story that scrolls away by morning. The
              events that would have changed someone&apos;s semester get buried
              under noise.
            </p>
            <p>
              Pulchowk Events started as a Discord bot that scraped four college
              sites. When it began posting to eleven thousand students, it became
              obvious the community wanted more than a feed — they wanted a home.
              That is this.
            </p>
            <p>
              Everything here is run by students, verified by students, and built
              for students. No ads. No tracking. No paywall. The only thing we ask
              is that you use it — and occasionally, tell someone about it.
            </p>
            <p className="about-manifesto__accent">
              No ads. No tracking. No paywall.
            </p>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="about-section" data-reveal>
        <div className="w">
          <AboutNumbers numbers={numbers} />
        </div>
      </section>

      {/* What you can do */}
      <section className="about-section" data-reveal>
        <div className="w">
          <header className="about-section__head">
            <p className="about-section__eyebrow">What you can do</p>
            <h2 className="about-section__title">
              Four surfaces. One account.
            </h2>
          </header>
          <div className="about-features">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="about-feature"
                  style={{ '--c': feature.tone } as React.CSSProperties}
                >
                  <span className="about-feature__icon">
                    <Icon size={16} />
                  </span>
                  <h3 className="about-feature__title">{feature.title}</h3>
                  <p className="about-feature__desc">{feature.description}</p>
                  <span className="about-feature__cta">
                    {feature.cta}
                    <ArrowRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="about-section" data-reveal>
        <div className="w">
          <header className="about-section__head">
            <p className="about-section__eyebrow">How it works</p>
            <h2 className="about-section__title">
              Three steps to being in the loop.
            </h2>
          </header>
          <div className="about-steps">
            <span className="about-steps__line" aria-hidden="true" />
            {STEPS.map((step) => (
              <div key={step.n} className="about-step">
                <span className="about-step__num">{step.n}</span>
                <h3 className="about-step__title">{step.title}</h3>
                <p className="about-step__desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For clubs */}
      <section className="about-section" data-reveal>
        <div className="w">
          <header className="about-section__head">
            <p className="about-section__eyebrow">For clubs</p>
            <h2 className="about-section__title">
              Bring your community onto the platform.
            </h2>
          </header>
          <div className="about-clubs">
            <a
              href={CLUB_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="about-club"
            >
              <header className="about-club__head">
                <h3 className="about-club__title">Enroll your club</h3>
                <ExternalLink size={14} className="about-club__icon" aria-hidden="true" />
              </header>
              <p className="about-club__desc">
                Submit your club details. We verify you and set up an events
                channel so students can follow what you are running.
              </p>
            </a>
            <a
              href={CLUB_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="about-club"
            >
              <header className="about-club__head">
                <h3 className="about-club__title">Link your Discord</h3>
                <ExternalLink size={14} className="about-club__icon" aria-hidden="true" />
              </header>
              <p className="about-club__desc">
                Connect your server and receive verified event announcements
                directly into your channels, no manual copy-paste.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="about-section" data-reveal>
        <div className="w about-faq">
          <header className="about-section__head">
            <p className="about-section__eyebrow">FAQ</p>
            <h2 className="about-section__title">Common questions.</h2>
          </header>
          <div className="about-faq__list">
            {FAQS.map((faq) => (
              <details key={faq.q} className="about-faq__item">
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

      {/* Closing CTA */}
      <section className="about-section about-cta" data-reveal>
        <div className="w about-cta__inner">
          <h2 className="about-cta__title">Ready when you are.</h2>
          <p className="about-cta__sub">
            Join eleven thousand students already using it.
          </p>
          <div className="about-cta__actions">
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
            <Link href="/product-hunt" className="btn btn--secondary">
              <span className="btn__label">See student projects</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                See student projects
              </span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
