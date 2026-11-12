import Layout from './components/layout/Layout';
import Link from 'next/link';
import { Award } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import LoungeClient from './lounge/LoungeClient';
import TopDonators from '@/app/components/donate/TopDonators';
import { PageHeader } from '@/components/ui/PageHeader';
import { getLoungePosts, getSidebarData } from '@/app/lib/queries';
import { formatDateShort } from '@/app/lib/formatDate';
import LandingRoot from '@/app/components/landing/LandingRoot';
import '@/app/landing/landing.css';

export const revalidate = 60;

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) return <LandingRoot />;

  const [posts, { donors, products, upcomingEvents }] = await Promise.all([
    getLoungePosts(6),
    getSidebarData(),
  ]);

  const firstName = session.user?.name?.split(' ')[0] || 'there';

  return (
    <Layout>
      <div className="w">
        <PageHeader
          eyebrow="Home"
          title={'Welcome back, ' + firstName + '.'}
          description="What moved while you were away."
        />

        <div className="home-feed">
          <LoungeClient
            initialPosts={posts || []}
            userId={session?.user?.id}
          />
        </div>

        <div className="home-grid">
          <section className="home-card">
            <header className="home-card__head">
              <h2 className="home-card__title">Upcoming events</h2>
              <Link href="/events" className="home-card__see">See all</Link>
            </header>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <ul className="home-list">
                {upcomingEvents.map((event) => (
                  <li key={event.id}>
                    <Link href={'/events/' + event.id} className="home-row">
                      <span className="home-row__main">{event.title}</span>
                      <span className="home-row__meta">{formatDateShort(event.event_date)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="home-empty">No upcoming events.</p>
            )}
          </section>

          <section className="home-card">
            <header className="home-card__head">
              <h2 className="home-card__title">
                <Award size={16} style={{ marginRight: 8, verticalAlign: -2 }} />
                Top donors
              </h2>
              <Link href="/donate" className="home-card__see">Donate</Link>
            </header>
            {donors && donors.length > 0 ? (
              <TopDonators donators={donors} />
            ) : (
              <p className="home-empty">No donors yet.</p>
            )}
          </section>

          <section className="home-card">
            <header className="home-card__head">
              <h2 className="home-card__title">Recent projects</h2>
              <Link href="/product-hunt" className="home-card__see">See all</Link>
            </header>
            {products && products.length > 0 ? (
              <ul className="home-list">
                {products.map((product) => (
                  <li key={product.id}>
                    <Link href={'/product-hunt/' + product.url} className="home-row">
                      <span className="home-row__main">{product.name}</span>
                      <span className="home-row__meta">{formatDateShort(product.created_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="home-empty">No projects yet.</p>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
