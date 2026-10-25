import Layout from '@/app/components/layout/Layout';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, Calendar, Package, MessageCircle,
  Check, GraduationCap, Globe, ExternalLink, Bell,
  TrendingUp, Users, Shield
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import PrizePoolProgress from '@/app/components/donate/SmPrizePoolProgress';

export const revalidate = 0;

export default async function AboutPage() {
  // ---- Data ----
  const { data: prizePool } = await supabase
    .from('prize_pool')
    .select('target_amount')
    .single();

  const { data: verifiedDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('verified', true);

  const current_amount = verifiedDonations?.reduce(
    (sum, donation) => sum + donation.amount,
    0
  ) || 0;

  const { count: total_donors } = await supabase
    .from('donations')
    .select('*', { count: 'exact' })
    .eq('verified', true);

  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('verified', true);

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('approved', true);

  // ---- Static content ----
  const stats = [
    { label: 'Campus events hosted', value: totalEvents || 0 },
    { label: 'Student projects showcased', value: totalProducts || 0 },
    { label: 'Community donors', value: total_donors || 0 },
    { label: 'Prize pool raised', value: `$${current_amount.toLocaleString()}` },
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Discover events',
      description:
        'Browse verified campus events from IOE and beyond. Register in one click, get reminded when it matters.',
      cta: 'See upcoming events',
      href: '/events',
    },
    {
      icon: Package,
      title: 'Showcase projects',
      description:
        'Post your student project in our Product Hunt. Get votes, feedback, and a shot at the prize pool.',
      cta: 'Browse the Product Hunt',
      href: '/product-hunt',
    },
    {
      icon: MessageCircle,
      title: 'Join the lounge',
      description:
        'A community feed built for students. Ask questions, share wins, find collaborators for your next thing.',
      cta: 'Open the lounge',
      href: '/lounge',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Sign in',
      description: 'One click with Discord or Google. No forms, no passwords.',
    },
    {
      number: 2,
      title: 'Explore or submit',
      description:
        'Browse events, vote on projects, or submit your own. Everything is one submit away.',
    },
    {
      number: 3,
      title: 'Stay in the loop',
      description:
        'Follow channels on Discord to get pinged for events you actually care about.',
    },
  ];

  const faqs = [
    {
      q: 'Is this only for Pulchowk students?',
      a: 'No. Most events are in the "Open" category and welcome everyone. A smaller number are "Exclusive" to Pulchowk students, usually because they\'re held on campus or have limited seats. Every event is clearly labelled, so you always know what you\'re signing up for.',
    },
    {
      q: 'Do I need an account to browse?',
      a: 'You can browse events, projects, and the lounge without signing in. An account is only needed for actions like submitting a project, voting, posting in the lounge, or enrolling a club.',
    },
    {
      q: 'How do I submit an event or project?',
      a: 'Sign in, then use the "Add Event" button on /events or the "Add Product" button on /product-hunt. Submissions go into a review queue and are typically approved within a day.',
    },
    {
      q: 'Where does the prize pool go?',
      a: 'One hundred percent of donations fund the prize pool for our student investing competitions and merit-based awards. No platform overhead is taken out — every dollar reaches students.',
    },
  ];

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Left Sidebar — consistent with the rest of the site */}
            <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
              <div className="bg-card border border-border rounded-xl p-5 shadow-lg sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <h2 className="text-xl font-semibold text-foreground">Community</h2>
                </div>

                <div className="space-y-4">
                  <a
                    href="https://discord.gg/cQ5gxusATk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-muted/30 hover:bg-accent transition-colors p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500 rounded-lg p-2">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-foreground">Join Discord</span>
                    </div>
                    <span className="bg-muted rounded-full px-2.5 py-1 text-xs text-foreground">
                      1,050+
                    </span>
                  </a>

                  <div className="pt-2">
                    <PrizePoolProgress
                      currentAmount={current_amount}
                      targetAmount={prizePool?.target_amount || 100000}
                      totalDonors={total_donors || 0}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="w-full space-y-6">
              {/* 1. Hero */}
              <section className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 blur-3xl bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 blur-3xl bg-blue-500/10 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium mb-5">
                    <Sparkles className="w-3.5 h-3.5" />
                    About Pulchowk Events
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                    Built by students. Open to everyone.
                  </h1>

                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-7">
                    Campus events, student projects, and a community that makes both happen — all in one place.
                    From Pulchowk, for all of Nepal.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://discord.gg/cQ5gxusATk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Join the Discord
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <Link
                      href="/events"
                      className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground px-6 py-2.5 rounded-lg font-medium transition-colors border border-border"
                    >
                      Browse events
                    </Link>
                  </div>
                </div>
              </section>

              {/* 2. Stats */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card border border-border rounded-xl p-5 shadow-lg"
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </section>

              {/* 3. Features — what you can do here */}
              <section>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-foreground">What you can do here</h2>
                  <p className="text-muted-foreground mt-1">
                    Three ways the platform is built to help you.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <Link
                        key={feature.title}
                        href={feature.href}
                        className="group bg-card border border-border rounded-xl p-5 shadow-lg hover:border-green-500/50 transition-colors"
                      >
                        <div className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 p-2.5 rounded-lg w-fit mb-4">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {feature.description}
                        </p>
                        <div className="text-sm text-green-600 dark:text-green-400 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                          {feature.cta}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* 4. Who it's for — direct answer to "is this for me?" */}
              <section>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-foreground">Who it's for</h2>
                  <p className="text-muted-foreground mt-1">
                    Every event is labelled. You always know what you're walking into.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 p-2.5 rounded-lg">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Pulchowk students</h3>
                        <p className="text-xs text-muted-foreground">The full experience</p>
                      </div>
                    </div>
                    <ul className="space-y-2.5 text-sm">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">
                          Access to both <span className="font-medium">Open</span> and{' '}
                          <span className="font-medium">Exclusive</span> events
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">Prize pool eligibility for competitions</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">Priority access to club-led workshops</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 p-2.5 rounded-lg">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Everyone else</h3>
                        <p className="text-xs text-muted-foreground">You're welcome here too</p>
                      </div>
                    </div>
                    <ul className="space-y-2.5 text-sm">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">
                          Access to all <span className="font-medium">Open</span> events
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">Submit projects, vote, and comment</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">Post in the community lounge</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 5. How it works */}
              <section className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-lg">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">How it works</h2>
                  <p className="text-muted-foreground mt-1">
                    Three steps from "what is this?" to "I'm in."
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className="flex gap-4 md:flex-col md:gap-3 md:items-center md:text-center"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 flex items-center justify-center font-bold">
                          {step.number}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 6. For clubs */}
              <section className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-xl flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      For clubs & communities
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Bring your club onto the platform and get your events in front of the right people.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="https://forms.gle/gjburXWczani9S6y7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-muted/30 hover:bg-accent rounded-xl p-5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">Enroll your club</h3>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Submit your club details. We'll verify you and set up an events channel.
                    </p>
                  </a>

                  <a
                    href="https://forms.gle/gjburXWczani9S6y7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-muted/30 hover:bg-accent rounded-xl p-5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">Link your Discord</h3>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Connect your server to receive event announcements directly into your channels.
                    </p>
                  </a>
                </div>
              </section>

              {/* 7. FAQ */}
              <section className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-lg">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Frequently asked questions
                  </h2>
                </div>
                <dl className="space-y-5">
                  {faqs.map((faq, i) => (
                    <div key={i} className={i > 0 ? 'pt-5 border-t border-border' : ''}>
                      <dt className="font-semibold text-foreground mb-2">{faq.q}</dt>
                      <dd className="text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* 8. Final CTA */}
              <section className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-1/2 w-96 h-96 blur-3xl bg-green-500/10 rounded-full -translate-x-1/2 -translate-y-2/3 pointer-events-none" />

                <div className="relative text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                    Ready to get started?
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                    Join over a thousand students, builders, and organisers already on the platform.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="https://discord.gg/cQ5gxusATk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Join the Discord
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <Link
                      href="/product-hunt"
                      className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground px-6 py-2.5 rounded-lg font-medium transition-colors border border-border"
                    >
                      See student projects
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}