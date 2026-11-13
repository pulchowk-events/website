import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { PostRow } from "@/app/components/shell/rows/PostRow";
import {
  getHomeStats,
  getLoungePosts,
  getScholarships24h,
  getDailyActivity,
  getTechSkillDemand,
  getClosingSoonScholarships,
  getWeekdayPattern,
} from "@/app/lib/queries";
import { ActivityChart } from "@/app/components/home/ActivityChart";
import { SkillDemand } from "@/app/components/home/SkillDemand";
import { ClosingSoon } from "@/app/components/home/ClosingSoon";
import { WeekdayPattern } from "@/app/components/home/WeekdayPattern";
import { AnimatedNumber } from "@/app/components/ui/AnimatedNumber";

export const revalidate = 60;

function greeting(): string {
  // Site canonical timezone is Nepal (per design system). Server runs UTC.
  const nptHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kathmandu",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date()),
  );
  if (nptHour < 12) return "Good morning";
  if (nptHour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const [stats, posts, scholarships24h, activity, skills, closing, weekday] = await Promise.all([
    getHomeStats(userId),
    getLoungePosts(5),
    getScholarships24h(),
    getDailyActivity(7),
    getTechSkillDemand(6, 60),
    getClosingSoonScholarships(4),
    getWeekdayPattern(90),
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
      />

      <div className="stat-tiles">
        <Link href="/events?tab=upcoming" className="stat-tile">
          <span className="stat-tile__label">Events this week</span>
          <span className="stat-tile__value"><AnimatedNumber value={stats.events_this_week} /></span>
        </Link>
        <Link href="/jobs" className="stat-tile">
          <span className="stat-tile__label">New jobs today</span>
          <span className="stat-tile__value"><AnimatedNumber value={stats.jobs_24h} /></span>
        </Link>
        <Link href={session ? "/saved" : "/product-hunt"} className="stat-tile">
          <span className="stat-tile__label">{session ? "Your saved" : "Projects launched"}</span>
          <span className="stat-tile__value"><AnimatedNumber value={session ? stats.saved_count : stats.projects_total} /></span>
        </Link>
        <Link href="/scholarships" className="stat-tile">
          <span className="stat-tile__label">New scholarships</span>
          <span className="stat-tile__value"><AnimatedNumber value={scholarships24h} /></span>
        </Link>
      </div>

      <div className="insight-grid">
        <div className="insight-col insight-col--wide">
          <ActivityChart data={activity} />
          <section className="home-section lounge-inline">
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
        </div>
        <div className="insight-col insight-col--narrow">
          <WeekdayPattern data={weekday} />
          <SkillDemand rows={skills} />
          <ClosingSoon rows={closing} />
        </div>
      </div>
    </Layout>
  );
}
