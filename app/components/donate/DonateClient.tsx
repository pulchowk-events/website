'use client';

import { Session } from 'next-auth';
import DonateForm from '@/app/components/donate/DonateForm';
import TopDonators from '@/app/components/donate/TopDonators';
import { PageHeader } from '@/components/ui/PageHeader';

interface Donator {
  id: number;
  name: string;
  amount: number;
  avatar_url: string | null;
}

interface PrizePool {
  current_amount: number;
  target_amount: number;
}

interface DonateClientProps {
  session: Session | null;
  donators: Donator[];
  prizePool: PrizePool | null;
}

function formatUSD(n: number | null | undefined): string {
  return '$' + (n || 0).toLocaleString('en-US');
}

export default function DonateClient({ session, donators, prizePool }: DonateClientProps) {
  return (
    <div className="w">
      <PageHeader
        eyebrow="Donate"
        title="Support future innovators."
        description="Your contribution helps students learn real-world investing skills and funds promising projects."
      />

      <div className="donate-grid">
        <div className="donate-grid__form">
          <DonateForm
            initialUserData={{
              name: session?.user?.name || '',
              email: session?.user?.email || '',
            }}
          />
        </div>

        <aside className="donate-grid__sidebar">
          <section className="card">
            <h2 className="card__title" style={{ fontSize: 16 }}>
              Top donors
            </h2>
            <div style={{ marginTop: 16 }}>
              <TopDonators donators={donators || []} />
            </div>
          </section>

          <section className="card">
            <h2 className="card__title" style={{ fontSize: 16 }}>
              About the prize pool
            </h2>
            <p className="donate-pool__text">
              The prize pool funds educational investing competitions and provides seed
              capital for student projects.
            </p>
            <p className="donate-pool__text">
              100% of donations go directly to students through competitive challenges and
              merit-based awards.
            </p>
            <dl className="donate-pool__stats">
              <div>
                <dt>Current pool</dt>
                <dd>{formatUSD(prizePool?.current_amount)}</dd>
              </div>
              <div>
                <dt>Target goal</dt>
                <dd className="donate-pool__target">{formatUSD(prizePool?.target_amount)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
