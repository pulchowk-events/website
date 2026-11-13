import type { Metadata } from "next";
import Link from "next/link";
import { Search, MessageSquare, Calendar, Briefcase, Package, GraduationCap } from "lucide-react";
import Layout from "@/app/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { PostRow } from "@/app/components/shell/rows/PostRow";
import { EventRow } from "@/app/components/shell/rows/EventRow";
import { JobRow } from "@/app/components/shell/rows/JobRow";
import { ProjectRow } from "@/app/components/shell/rows/ProjectRow";
import { ScholarshipRow } from "@/app/components/scholarships/ScholarshipRow";
import { supabase } from "@/app/lib/supabase";
import { normalizeRelation } from "@/app/lib/supabase-helpers";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

const PAGE_SIZE = 20;

function escLike(q: string): string {
  return q.replace(/[%_\\]/g, "\\$&");
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; scope?: string | string[]; page?: string | string[] }>;
}) {
  const sp = await searchParams;
  const rawQ = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const rawScope = Array.isArray(sp.scope) ? sp.scope[0] : sp.scope;
  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const q = (rawQ || "").trim();
  const scope =
    rawScope === "posts" ||
    rawScope === "events" ||
    rawScope === "jobs" ||
    rawScope === "projects" ||
    rawScope === "scholarships"
      ? rawScope
      : "all";
  const page = Math.max(1, parseInt(rawPage || "1", 10) || 1);

  if (!q) {
    return (
      <Layout railContext="utility">
        <PageHeader title="Search" description="Find events, jobs, posts, projects, and scholarships across the site." />
        <form action="/search" method="get" className="search-form-lg">
          <Search size={16} />
          <input name="q" type="search" placeholder="Search anything..." autoFocus aria-label="Search" />
          <button type="submit" className="btn btn--primary btn--sm">Search</button>
        </form>
        <div className="empty-row" style={{ marginTop: 16 }}>
          <p>Type a query above to begin.</p>
        </div>
      </Layout>
    );
  }

  const ilike = "%" + escLike(q) + "%";
  const offset = (page - 1) * PAGE_SIZE;

  const [pc, ec, jc, prc, sc] = await Promise.all([
    supabase.from("lounge_posts").select("*", { count: "exact", head: true }).or("title.ilike." + ilike + ",content.ilike." + ilike),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("verified", true).or("title.ilike." + ilike + ",description.ilike." + ilike),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("verified", true).or("title.ilike." + ilike + ",company.ilike." + ilike),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("approved", true).or("name.ilike." + ilike + ",description.ilike." + ilike),
    supabase.from("scholarships").select("*", { count: "exact", head: true }).eq("verified", true).ilike("title", ilike),
  ]);

  const counts = {
    posts: pc.count || 0,
    events: ec.count || 0,
    jobs: jc.count || 0,
    projects: prc.count || 0,
    scholarships: sc.count || 0,
  };
  const total = counts.posts + counts.events + counts.jobs + counts.projects + counts.scholarships;

  let posts: any[] = [];
  let events: any[] = [];
  let jobs: any[] = [];
  let projects: any[] = [];
  let scholarships: any[] = [];

  if (scope === "all") {
    const [p, e, j, pr, sch] = await Promise.all([
      supabase.from("lounge_posts").select("id, title, content, category, created_at, image_url, show_embed_image, users:author_id(name, image)").or("title.ilike." + ilike + ",content.ilike." + ilike).order("created_at", { ascending: false }).limit(5),
      supabase.from("events").select("id, title, event_date, category, location, price").eq("verified", true).or("title.ilike." + ilike + ",description.ilike." + ilike).order("event_date", { ascending: true }).limit(5),
      supabase.from("jobs").select("id, title, company, location, employment_type, posted_at").eq("verified", true).or("title.ilike." + ilike + ",company.ilike." + ilike).order("posted_at", { ascending: false }).limit(5),
      supabase.from("products").select("id, name, url, description, image_url, votes").eq("approved", true).or("name.ilike." + ilike + ",description.ilike." + ilike).order("votes", { ascending: false }).limit(5),
      supabase.from("scholarships").select("*").eq("verified", true).ilike("title", ilike).order("posted_at", { ascending: false }).limit(5),
    ]);
    posts = (p.data || []).map((x: any) => ({ ...x, users: normalizeRelation(x.users) }));
    events = e.data || [];
    jobs = j.data || [];
    projects = pr.data || [];
    scholarships = sch.data || [];
  } else if (scope === "posts") {
    const { data } = await supabase.from("lounge_posts").select("id, title, content, category, created_at, image_url, show_embed_image, users:author_id(name, image)").or("title.ilike." + ilike + ",content.ilike." + ilike).order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
    posts = (data || []).map((x: any) => ({ ...x, users: normalizeRelation(x.users) }));
  } else if (scope === "events") {
    const { data } = await supabase.from("events").select("id, title, event_date, category, location, price").eq("verified", true).or("title.ilike." + ilike + ",description.ilike." + ilike).order("event_date", { ascending: true }).range(offset, offset + PAGE_SIZE - 1);
    events = data || [];
  } else if (scope === "jobs") {
    const { data } = await supabase.from("jobs").select("id, title, company, location, employment_type, posted_at").eq("verified", true).or("title.ilike." + ilike + ",company.ilike." + ilike).order("posted_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
    jobs = data || [];
  } else if (scope === "projects") {
    const { data } = await supabase.from("products").select("id, name, url, description, image_url, votes").eq("approved", true).or("name.ilike." + ilike + ",description.ilike." + ilike).order("votes", { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
    projects = data || [];
  } else if (scope === "scholarships") {
    const { data } = await supabase.from("scholarships").select("*").eq("verified", true).ilike("title", ilike).order("posted_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
    scholarships = data || [];
  }

  const scopeTotal =
    scope === "posts" ? counts.posts :
    scope === "events" ? counts.events :
    scope === "jobs" ? counts.jobs :
    scope === "projects" ? counts.projects :
    scope === "scholarships" ? counts.scholarships :
    total;
  const totalPages = Math.max(1, Math.ceil(scopeTotal / PAGE_SIZE));

  const tabs: { value: "all" | "posts" | "events" | "jobs" | "projects" | "scholarships"; label: string; count: number }[] = [
    { value: "all", label: "All", count: total },
    { value: "posts", label: "Posts", count: counts.posts },
    { value: "events", label: "Events", count: counts.events },
    { value: "jobs", label: "Jobs", count: counts.jobs },
    { value: "projects", label: "Products", count: counts.projects },
    { value: "scholarships", label: "Scholarships", count: counts.scholarships },
  ];

  return (
    <Layout railContext="utility">
      <PageHeader title={"Results for " + q} />

      <form action="/search" method="get" className="search-form-lg">
        <Search size={16} />
        <input name="q" type="search" defaultValue={q} placeholder="Search anything..." aria-label="Search" />
        <button type="submit" className="btn btn--primary btn--sm">Search</button>
      </form>

      <nav className="search-tabs" aria-label="Scope">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={"/search?q=" + encodeURIComponent(q) + "&scope=" + t.value}
            className={"search-tab" + (scope === t.value ? " search-tab--on" : "")}
          >
            {t.label}
            <span className="search-tab__count">{t.count}</span>
          </Link>
        ))}
      </nav>

      {total === 0 ? (
        <div className="empty-row" style={{ marginTop: 16 }}>
          <p>No results for {q}. Try a shorter phrase, or browse:</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/events" className="btn btn--secondary btn--sm">Browse events</Link>
            <Link href="/jobs" className="btn btn--secondary btn--sm">Browse jobs</Link>
            <Link href="/product-hunt" className="btn btn--secondary btn--sm">Browse products</Link>
            <Link href="/scholarships" className="btn btn--secondary btn--sm">Browse scholarships</Link>
          </div>
        </div>
      ) : scope === "all" ? (
        <div className="search-groups">
          {posts.length > 0 && (
            <section className="search-group">
              <header className="search-group__head">
                <h2 className="search-group__title"><MessageSquare size={12} /> Posts <span>{counts.posts}</span></h2>
                <Link href={"/search?q=" + encodeURIComponent(q) + "&scope=posts"} className="search-group__see">See all</Link>
              </header>
              <div className="row-list">{posts.map((p) => <PostRow key={p.id} post={p} showThumb showExcerpt />)}</div>
            </section>
          )}
          {events.length > 0 && (
            <section className="search-group">
              <header className="search-group__head">
                <h2 className="search-group__title"><Calendar size={12} /> Events <span>{counts.events}</span></h2>
                <Link href={"/search?q=" + encodeURIComponent(q) + "&scope=events"} className="search-group__see">See all</Link>
              </header>
              <div className="row-list">{events.map((e) => <EventRow key={e.id} event={e} />)}</div>
            </section>
          )}
          {jobs.length > 0 && (
            <section className="search-group">
              <header className="search-group__head">
                <h2 className="search-group__title"><Briefcase size={12} /> Jobs <span>{counts.jobs}</span></h2>
                <Link href={"/search?q=" + encodeURIComponent(q) + "&scope=jobs"} className="search-group__see">See all</Link>
              </header>
              <div className="row-list">{jobs.map((j) => <JobRow key={j.id} job={j} />)}</div>
            </section>
          )}
          {projects.length > 0 && (
            <section className="search-group">
              <header className="search-group__head">
                <h2 className="search-group__title"><Package size={12} /> Projects <span>{counts.projects}</span></h2>
                <Link href={"/search?q=" + encodeURIComponent(q) + "&scope=projects"} className="search-group__see">See all</Link>
              </header>
              <div className="row-list">{projects.map((p, i) => <ProjectRow key={p.id} project={p} rank={i + 1} />)}</div>
            </section>
          )}
          {scholarships.length > 0 && (
            <section className="search-group">
              <header className="search-group__head">
                <h2 className="search-group__title"><GraduationCap size={12} /> Scholarships <span>{counts.scholarships}</span></h2>
                <Link href={"/search?q=" + encodeURIComponent(q) + "&scope=scholarships"} className="search-group__see">See all</Link>
              </header>
              <div className="row-list">{scholarships.map((s) => <ScholarshipRow key={s.id} scholarship={s} />)}</div>
            </section>
          )}
        </div>
      ) : (
        <>
          {scope === "posts" && posts.length > 0 && <div className="row-list">{posts.map((p) => <PostRow key={p.id} post={p} showThumb showExcerpt />)}</div>}
          {scope === "events" && events.length > 0 && <div className="row-list">{events.map((e) => <EventRow key={e.id} event={e} />)}</div>}
          {scope === "jobs" && jobs.length > 0 && <div className="row-list">{jobs.map((j) => <JobRow key={j.id} job={j} />)}</div>}
          {scope === "projects" && projects.length > 0 && <div className="row-list">{projects.map((p) => <ProjectRow key={p.id} project={p} />)}</div>}
          {scope === "scholarships" && scholarships.length > 0 && <div className="row-list">{scholarships.map((s) => <ScholarshipRow key={s.id} scholarship={s} />)}</div>}
          {scopeTotal === 0 && (
            <div className="empty-row" style={{ marginTop: 16 }}>
              <p>No results in this category.</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="jobs-pager">
              <span className="jobs-pager__label">Page {page} of {totalPages}</span>
              <div className="jobs-pager__actions">
                {page > 1 && (
                  <Link href={"/search?q=" + encodeURIComponent(q) + "&scope=" + scope + "&page=" + (page - 1)} className="btn btn--secondary btn--sm">Previous</Link>
                )}
                {page < totalPages && (
                  <Link href={"/search?q=" + encodeURIComponent(q) + "&scope=" + scope + "&page=" + (page + 1)} className="btn btn--secondary btn--sm">Next</Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
