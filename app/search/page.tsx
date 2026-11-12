import type { Metadata } from 'next';
import Layout from '@/app/components/layout/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Box, MessageSquare, Search as SearchIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/ui/PageHeader';
import { supabase } from '@/app/lib/supabase';
import { getSidebarData } from '@/app/lib/queries';
import { normalizeRelation } from '@/app/lib/supabase-helpers';
import { formatDateShort } from '@/app/lib/formatDate';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search events, projects, and community posts across Pulchowk Events.',
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (rawQuery ?? '').trim();
  const hasQuery = query.length > 0;
  const safeQuery = query.replace(/[%_\\]/g, '\\$&');

  const sidebarData = hasQuery ? null : await getSidebarData();

  const [postsRes, eventsRes, productsRes] = hasQuery
    ? await Promise.all([
        supabase
          .from('lounge_posts')
          .select('id, title, content, created_at, users:author_id (name, image)')
          .or('title.ilike.%' + safeQuery + '%,content.ilike.%' + safeQuery + '%')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('events')
          .select(
            'id, title, description, event_date, created_at, category, image_url, users:created_by (name, image)'
          )
          .or('title.ilike.%' + safeQuery + '%,description.ilike.%' + safeQuery + '%')
          .eq('verified', true)
          .order('event_date', { ascending: true })
          .limit(5),
        supabase
          .from('products')
          .select(
            'id, name, description, url, image_url, created_at, users:posted_by (name, image)'
          )
          .or('name.ilike.%' + safeQuery + '%,description.ilike.%' + safeQuery + '%')
          .eq('approved', true)
          .order('created_at', { ascending: false })
          .limit(5),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const posts = (postsRes.data || []).map((p: any) => ({
    ...p,
    users: normalizeRelation(p.users),
  }));
  const events = (eventsRes.data || []).map((e: any) => ({
    ...e,
    users: normalizeRelation(e.users),
  }));
  const matchingProducts = (productsRes.data || []).map((p: any) => ({
    ...p,
    users: normalizeRelation(p.users),
  }));

  const totalResults = posts.length + events.length + matchingProducts.length;

  return (
    <Layout>
      <div className="w">
        <PageHeader
          eyebrow="Search"
          title={hasQuery ? '"' + query + '"' : 'Search Pulchowk Events.'}
          description={
            hasQuery
              ? totalResults +
                ' result' +
                (totalResults === 1 ? '' : 's') +
                ' across posts, events, and projects.'
              : 'Find events, projects, and community posts.'
          }
        />

        <form action="/search" method="get" className="search-form" role="search">
          <SearchIcon size={16} className="search-form__icon" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search events, projects, and posts…"
            className="search-form__input"
            aria-label="Search query"
          />
          <button type="submit" className="btn btn--primary btn--sm">
            <span className="btn__label">Search</span>
            <span className="btn__label btn__label--dup" aria-hidden="true">Search</span>
          </button>
        </form>

        {!hasQuery && (
          <div className="search-idle">
            <p className="search-idle__hint">
              Start typing above, or explore what&apos;s already here.
            </p>
            {sidebarData && (
              <div className="home-grid">
                <section className="home-card">
                  <header className="home-card__head">
                    <h2 className="home-card__title">Upcoming events</h2>
                    <Link href="/events" className="home-card__see">See all</Link>
                  </header>
                  {sidebarData.upcomingEvents.length > 0 ? (
                    <ul className="home-list">
                      {sidebarData.upcomingEvents.map((e: any) => (
                        <li key={e.id}>
                          <Link href={'/events/' + e.id} className="home-row">
                            <span className="home-row__main">{e.title}</span>
                            <span className="home-row__meta">{formatDateShort(e.event_date)}</span>
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
                    <h2 className="home-card__title">Recent projects</h2>
                    <Link href="/product-hunt" className="home-card__see">See all</Link>
                  </header>
                  {sidebarData.products.length > 0 ? (
                    <ul className="home-list">
                      {sidebarData.products.map((p: any) => (
                        <li key={p.id}>
                          <Link href={'/product-hunt/' + p.url} className="home-row">
                            <span className="home-row__main">{p.name}</span>
                            <span className="home-row__meta">{formatDateShort(p.created_at)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="home-empty">No projects yet.</p>
                  )}
                </section>

                <section className="home-card">
                  <header className="home-card__head">
                    <h2 className="home-card__title">Top donors</h2>
                    <Link href="/donate" className="home-card__see">Donate</Link>
                  </header>
                  <p className="home-empty">Support student competitions.</p>
                </section>
              </div>
            )}
          </div>
        )}

        {hasQuery && totalResults === 0 && (
          <div className="empty-state" style={{ marginTop: 24 }}>
            <p className="empty-state__title">No results for &ldquo;{query}&rdquo;.</p>
            <p className="empty-state__desc">
              Try a shorter query, or search for a specific event or project name.
            </p>
          </div>
        )}

        {hasQuery && posts.length > 0 && (
          <section className="search-section">
            <header className="search-section__head">
              <MessageSquare size={16} className="search-section__icon" />
              <h2 className="search-section__title">Posts</h2>
              <span className="search-section__count">{posts.length}</span>
            </header>
            <ul className="search-list">
              {posts.map((post: any) => (
                <li key={post.id}>
                  <Link href={'/lounge/' + post.id} className="search-row">
                    <span className="search-row__avatar">
                      <Image
                        src={post.users?.image || '/default-avatar.png'}
                        alt={post.users?.name || 'User'}
                        width={32}
                        height={32}
                        className="search-row__avatar-img"
                      />
                    </span>
                    <div className="search-row__body">
                      <p className="search-row__title">{post.title}</p>
                      <p className="search-row__meta" suppressHydrationWarning>
                        by {post.users?.name || 'Anonymous'} ·{' '}
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasQuery && events.length > 0 && (
          <section className="search-section">
            <header className="search-section__head">
              <Calendar size={16} className="search-section__icon" />
              <h2 className="search-section__title">Events</h2>
              <span className="search-section__count">{events.length}</span>
            </header>
            <ul className="search-list">
              {events.map((event: any) => (
                <li key={event.id}>
                  <Link href={'/events/' + event.id} className="search-row">
                    <span className="search-row__thumb">
                      {event.image_url ? (
                        <Image
                          src={event.image_url}
                          alt={event.title || ''}
                          fill
                          unoptimized
                          sizes="48px"
                          className="search-row__thumb-img"
                        />
                      ) : (
                        <Calendar size={18} />
                      )}
                    </span>
                    <div className="search-row__body">
                      <p className="search-row__title">{event.title}</p>
                      <p className="search-row__meta">{formatDateShort(event.event_date)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasQuery && matchingProducts.length > 0 && (
          <section className="search-section">
            <header className="search-section__head">
              <Box size={16} className="search-section__icon" />
              <h2 className="search-section__title">Projects</h2>
              <span className="search-section__count">{matchingProducts.length}</span>
            </header>
            <ul className="search-list">
              {matchingProducts.map((product: any) => (
                <li key={product.id}>
                  <Link href={'/product-hunt/' + product.url} className="search-row">
                    <span className="search-row__thumb">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name || ''}
                          fill
                          unoptimized
                          sizes="48px"
                          className="search-row__thumb-img"
                        />
                      ) : (
                        <Box size={18} />
                      )}
                    </span>
                    <div className="search-row__body">
                      <p className="search-row__title">{product.name}</p>
                      {product.description && (
                        <p className="search-row__meta search-row__meta--clamp">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Layout>
  );
}
