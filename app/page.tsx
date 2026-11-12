import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { PostRow } from "@/app/components/shell/rows/PostRow";
import { ProjectRow } from "@/app/components/shell/rows/ProjectRow";
import { EventRow } from "@/app/components/shell/rows/EventRow";
import { JobRow } from "@/app/components/shell/rows/JobRow";
import {
  getHomeStats,
  getLoungePosts,
  getRecentProducts,
  getUpcomingEvents,
  getRecentJobs,
} from "@/app/lib/queries";

export const revalidate = 60;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const [stats, posts, projects, events, jobs] = await Promise.all([
    getHomeStats(userId),
    getLoungePosts(5),
    getRecentProducts(3),
    getUpcomingEvents(4),
    getRecentJobs(4),
  ]);

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <Layout railContext="home">
      <PageHeader
        size="sm"
        title={session ? greeting() + ", " + (firstName || "there") : "Events, jobs and projects from across Nepal"}
        description={
          new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            timeZone: "Asia/Kathmandu",
          })
        }
        actions={
          !session ? (
            <>
              <Link href="/auth/signin" className="btn btn--secondary btn--sm">Sign in</Link>
              <a href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm">Join Discord</a>
            </>
          ) : undefined
        }
      />

      <div className="stat-tiles">
        <Link href="/events?tab=upcoming" className="stat-tile">
          <span className="stat-tile__label">Events this week</span>
          <span className="stat-tile__value">{stats.events_this_week}</span>
        </Link>
        <Link href="/jobs" className="stat-tile">
          <span className="stat-tile__label">New jobs today</span>
          <span className="stat-tile__value">{stats.jobs_24h}</span>
        </Link>
        <Link href={session ? "/saved" : "/product-hunt"} className="stat-tile">
          <span className="stat-tile__label">{session ? "Your saved" : "Projects launched"}</span>
          <span className="stat-tile__value">{session ? stats.saved_count : stats.projects_total}</span>
        </Link>
        <Link href="/lounge" className="stat-tile">
          <span className="stat-tile__label">Posts today</span>
          <span className="stat-tile__value">{stats.posts_today}</span>
        </Link>
      </div>

      <div className="home-grid">
        <div className="home-col home-col--wide">
          <section className="home-section">
            <header className="home-section__head">
              <h2 className="home-section__title">Latest in Lounge</h2>
              <Link href="/lounge" className="home-section__see">See all</Link>
            </header>
            {posts.length === 0 ? (
              <p className="row-empty">No posts yet. <Link href="/lounge">Write the first one</Link></p>
            ) : (
              <div className="row-list">
                {posts.map((p: any) => <PostRow key={p.id} post={p} />)}
              </div>
            )}
          </section>

          <section className="home-section">
            <header className="home-section__head">
              <h2 className="home-section__title">Top projects</h2>
              <Link href="/product-hunt" className="home-section__see">See all</Link>
            </header>
            {projects.length === 0 ? (
              <p className="row-empty">No projects yet. <Link href="/product-hunt">Submit yours</Link></p>
            ) : (
              <div className="row-list">
                {projects.map((p: any, i: number) => <ProjectRow key={p.id} project={p} rank={i + 1} />)}
              </div>
            )}
          </section>
        </div>

        <div className="home-col">
          <section className="home-section">
            <header className="home-section__head">
              <h2 className="home-section__title">Happening soon</h2>
              <Link href="/events" className="home-section__see">See all</Link>
            </header>
            {events.length === 0 ? (
              <p className="row-empty">No events this week.</p>
            ) : (
              <div className="row-list">
                {events.map((e: any) => <EventRow key={e.id} event={e} compact />)}
              </div>
            )}
          </section>

          <section className="home-section">
            <header className="home-section__head">
              <h2 className="home-section__title">New jobs</h2>
              <Link href="/jobs" className="home-section__see">See all</Link>
            </header>
            {jobs.length === 0 ? (
              <p className="row-empty">No new jobs today.</p>
            ) : (
              <div className="row-list">
                {jobs.map((j: any) => <JobRow key={j.id} job={j} compact />)}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
