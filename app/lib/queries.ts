import { unstable_cache } from "next/cache";
import { supabase } from "@/app/lib/supabase";
import { normalizeRelation } from "@/app/lib/supabase-helpers";

// ============================================================================
// EVENT QUERIES
// ============================================================================

export interface EventFilters {
  tab: "upcoming" | "past";
  category: string;
  when: string;
  city: string;
  price: string;
  page: number;
  pageSize: number;
}

export const getEventsPage = unstable_cache(
  async (f: EventFilters) => {
    const { tab, category, when, city, price, page, pageSize } = f;
    const offset = (page - 1) * pageSize;
    const nowISO = new Date().toISOString();

    let q = supabase
      .from("events")
      .select(`*, author:created_by (id, name, image)`, { count: "exact" })
      .eq("verified", true);

    if (tab === "upcoming") {
      q = q.gte("event_date", nowISO).order("event_date", { ascending: true });
    } else {
      q = q.lt("event_date", nowISO).order("event_date", { ascending: false });
    }

    if (category !== "all") q = q.eq("category", category);
    if (city !== "all") q = q.eq("city", city);
    if (price === "free") q = q.eq("is_free", true);
    if (price === "paid") q = q.eq("is_free", false);

    if (when !== "all" && tab === "upcoming") {
      const now = new Date();
      let cutoff: Date | null = null;
      if (when === "today") {
        cutoff = new Date(now);
        cutoff.setHours(23, 59, 59, 999);
      } else if (when === "week") {
        cutoff = new Date(now.getTime() + 7 * 864e5);
      } else if (when === "weekend") {
        const day = now.getDay();
        const daysToSat = (6 - day + 7) % 7;
        cutoff = new Date(now.getTime() + (daysToSat + 2) * 864e5);
      } else if (when === "month") {
        cutoff = new Date(now.getTime() + 30 * 864e5);
      }
      if (cutoff) q = q.lte("event_date", cutoff.toISOString());
    }

    q = q.range(offset, offset + pageSize - 1);

    const { data, count } = await q;

    const events = (data || []).map((e: any) => ({
      ...e,
      author: normalizeRelation(e.author),
    }));

    return { events, totalCount: count || 0 };
  },
  ["events-page-v2"],
  { revalidate: 60, tags: ["events"] },
);

export const getEventById = unstable_cache(
  async (id: string) => {
    const { data } = await supabase
      .from("events")
      .select(`*, author:created_by (id, name, image, email)`)
      .eq("id", id)
      .eq("verified", true)
      .single();

    if (!data) return null;
    return { ...data, author: normalizeRelation((data as any).author) };
  },
  ["event-by-id"],
  { revalidate: 60, tags: ["events"] },
);

export const getUpcomingEvents = unstable_cache(
  async (limit = 3) => {
    const { data } = await supabase
      .from("events")
      .select(
        `
        id, title, event_date, category, location, price, image_url,
        author:created_by (name, image)
      `,
      )
      .eq("verified", true)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(limit);

    return (data || []).map((e: any) => ({
      ...e,
      author: normalizeRelation(e.author),
    }));
  },
  ["upcoming-events"],
  { revalidate: 60, tags: ["events"] },
);

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

export const getApprovedProducts = unstable_cache(
  async (sort: "today" | "week" | "all" = "all") => {
    let q = supabase
      .from("products")
      .select(
        "id, name, description, url, votes, created_at, image_url, posted_by, users:posted_by(name, image)",
      )
      .eq("approved", true)
      .order("votes", { ascending: false })
      .order("created_at", { ascending: false });
    if (sort === "today") {
      q = q.gte("created_at", new Date(Date.now() - 864e5).toISOString());
    } else if (sort === "week") {
      q = q.gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString());
    }
    const { data } = await q;
    return (data || []).map((p: any) => ({
      ...p,
      users: normalizeRelation(p.users),
    }));
  },
  ["approved-products-v2"],
  { revalidate: 60, tags: ["products"] },
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const { data } = await supabase
      .from("products")
      .select(
        "id, name, description, url, votes, created_at, posted_by, image_url, redirect_url, users:posted_by(name, image)",
      )
      .eq("url", slug)
      .single();
    if (!data) return null;
    return { ...(data as any), users: normalizeRelation((data as any).users) };
  },
  ["product-by-slug-v2"],
  { revalidate: 60, tags: ["products"] },
);

export const getRecentProducts = unstable_cache(
  async (limit = 3) => {
    const { data } = await supabase
      .from("products")
      .select("id, name, image_url, created_at, url, description")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return data || [];
  },
  ["recent-products"],
  { revalidate: 60, tags: ["products"] },
);

// ============================================================================
// LOUNGE QUERIES
// ============================================================================

export const getLoungePosts = unstable_cache(
  async (limit = 6) => {
    const { data } = await supabase
      .from("lounge_posts")
      .select(
        `
        *,
        users:author_id (id, name, image)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    return (data || []).map((p: any) => ({
      ...p,
      users: normalizeRelation(p.users),
    }));
  },
  ["lounge-posts"],
  { revalidate: 60, tags: ["lounge"] },
);

export const getLoungePostById = unstable_cache(
  async (id: string) => {
    const { data } = await supabase
      .from("lounge_posts")
      .select(
        `
        *,
        users:author_id (id, name, image, email)
      `,
      )
      .eq("id", id)
      .single();

    if (!data) return null;
    return { ...data, users: normalizeRelation((data as any).users) };
  },
  ["lounge-post-by-id"],
  { revalidate: 60, tags: ["lounge"] },
);

// ============================================================================
// DONATION / PRIZE POOL QUERIES
// ============================================================================

export const getPrizePool = unstable_cache(
  async () => {
    const { data: prizePool } = await supabase
      .from("prize_pool")
      .select("current_amount, target_amount")
      .single();

    const { data: verifiedDonations } = await supabase
      .from("donations")
      .select("amount")
      .eq("verified", true);

    const current_amount =
      verifiedDonations?.reduce((sum, d) => sum + d.amount, 0) || 0;

    const { count: totalDonors } = await supabase
      .from("donations")
      .select("*", { count: "exact" })
      .eq("verified", true);

    return {
      currentAmount: current_amount,
      targetAmount: prizePool?.target_amount || 100000,
      totalDonors: totalDonors || 0,
    };
  },
  ["prize-pool"],
  { revalidate: 60, tags: ["donations"] },
);

export const getTopDonators = unstable_cache(
  async (limit = 5) => {
    const { data } = await supabase
      .from("donations")
      .select("id, name, amount, avatar_url")
      .eq("show_on_leaderboard", true)
      .eq("verified", true)
      .order("amount", { ascending: false })
      .limit(limit);
    return data || [];
  },
  ["top-donators"],
  { revalidate: 60, tags: ["donations"] },
);

// ============================================================================
// ABOUT PAGE STATS
// ============================================================================

export const getAboutStats = unstable_cache(
  async () => {
    const [prizePool, { count: totalEvents }, { count: totalProducts }] =
      await Promise.all([
        getPrizePool(),
        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("verified", true),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("approved", true),
      ]);

    return {
      currentAmount: prizePool.currentAmount,
      targetAmount: prizePool.targetAmount,
      totalDonors: prizePool.totalDonors,
      totalEvents: totalEvents || 0,
      totalProducts: totalProducts || 0,
    };
  },
  ["about-stats"],
  { revalidate: 60, tags: ["events", "products", "donations"] },
);

// ============================================================================
// AGGREGATED SIDEBAR
// ============================================================================

export const getSidebarData = unstable_cache(
  async () => {
    const [prizePool, donors, products, upcomingEvents] = await Promise.all([
      getPrizePool(),
      getTopDonators(5),
      getRecentProducts(3),
      getUpcomingEvents(3),
    ]);
    return { prizePool, donors, products, upcomingEvents };
  },
  ["sidebar-data"],
  { revalidate: 60, tags: ["donations", "products", "events", "sidebar"] },
);

// ============================================================================
// JOB QUERIES
// ============================================================================

export interface JobFilters {
  q: string;
  types: string[];
  locations: string[];
  posted: string;
  sources: string[];
  salaryDisclosed: boolean;
  closingSoon: boolean;
  sort: "new" | "closing";
  page: number;
  pageSize: number;
}

export interface JobFacets {
  types: Record<string, number>;
  locations: Record<string, number>;
  sources: Record<string, number>;
}

const ALL_TYPES = ["full-time", "part-time", "internship", "contract", "freelance"];
const KNOWN_LOCATIONS = ["kathmandu", "lalitpur", "bhaktapur", "pokhara", "remote"];
const KNOWN_SOURCES = ["merojob", "kumarijob", "sathijob", "internsathi"];

export const getJobFacets = unstable_cache(
  async (): Promise<JobFacets> => {
    const { data } = await supabase
      .from("jobs")
      .select("employment_type, city, origin")
      .eq("verified", true);
    const types: Record<string, number> = {};
    const locations: Record<string, number> = {};
    const sources: Record<string, number> = {};
    for (const row of data || []) {
      const t = (row.employment_type || "").toLowerCase();
      for (const known of ALL_TYPES) {
        if (t.includes(known.replace("-", " ")) || t.includes(known)) {
          types[known] = (types[known] || 0) + 1;
          break;
        }
      }
      if (row.city) {
        locations[row.city] = (locations[row.city] || 0) + 1;
      }
      if (row.origin?.startsWith("scraper:")) {
        const key = row.origin.slice(8);
        const norm = KNOWN_SOURCES.find((k) => key.includes(k)) || key;
        sources[norm] = (sources[norm] || 0) + 1;
      }
    }
    return { types, locations, sources };
  },
  ["job-facets"],
  { revalidate: 60, tags: ["jobs"] },
);

export const getJobsPage = unstable_cache(
  async (f: JobFilters) => {
    const offset = (f.page - 1) * f.pageSize;
    const nowISO = new Date().toISOString();

    let q = supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("verified", true)
      .or("application_ends_at.is.null,application_ends_at.gte." + nowISO);

    if (f.q) {
      const safe = f.q.replace(/[%_\\\\]/g, "\\\\$&");
      q = q.or("title.ilike.%" + safe + "%,company.ilike.%" + safe + "%");
    }

    if (f.types.length > 0) {
      const orParts: string[] = [];
      for (const t of f.types) {
        const hyphen = t.toLowerCase();
        const spaced = t.replace(/-/g, " ").toLowerCase();
        orParts.push("employment_type.ilike.%" + hyphen + "%");
        orParts.push("employment_type.ilike.%" + spaced + "%");
      }
      q = q.or(orParts.join(","));
    }

    if (f.locations.length > 0) {
      q = q.in("city", f.locations);
    }

    if (f.posted === "24h") {
      q = q.gte("posted_at", new Date(Date.now() - 864e5).toISOString());
    } else if (f.posted === "7d") {
      q = q.gte("posted_at", new Date(Date.now() - 7 * 864e5).toISOString());
    } else if (f.posted === "30d") {
      q = q.gte("posted_at", new Date(Date.now() - 30 * 864e5).toISOString());
    }

    if (f.sources.length > 0) {
      const orParts = f.sources.map((s) => "origin.ilike.%scraper:" + s + "%");
      q = q.or(orParts.join(","));
    }

    if (f.salaryDisclosed) q = q.eq("salary_disclosed", true);

    if (f.closingSoon) {
      q = q.lte(
        "application_ends_at",
        new Date(Date.now() + 7 * 864e5).toISOString(),
      );
    }

    if (f.sort === "closing") {
      q = q.order("application_ends_at", { ascending: true, nullsFirst: false });
    } else {
      q = q.order("posted_at", { ascending: false });
    }

    q = q.range(offset, offset + f.pageSize - 1);

    const { data, count } = await q;
    return { jobs: data || [], totalCount: count || 0 };
  },
  ["jobs-page-v2"],
  { revalidate: 60, tags: ["jobs"] },
);

export const getJobById = unstable_cache(
  async (id: string) => {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("verified", true)
      .single();
    return data;
  },
  ["job-by-id"],
  { revalidate: 60, tags: ["jobs"] },
);

export const getRecentJobs = unstable_cache(
  async (limit = 3) => {
    const { data } = await supabase
      .from("jobs")
      .select(
        "id, title, company, image_url, posted_at, location, employment_type",
      )
      .eq("verified", true)
      .order("posted_at", { ascending: false })
      .limit(limit);
    return data || [];
  },
  ["recent-jobs"],
  { revalidate: 60, tags: ["jobs"] },
);

// ============================================================================
// pSEO QUERIES — dynamic taxonomies for /jobs/role, /jobs/company, etc.
// ============================================================================

import { JOB_ROLES, EVENT_CITIES, slugify, monthRange } from "./seo";

// --- /jobs/role/[role] ---
export const getJobsByRole = unstable_cache(
  async (roleSlug: string) => {
    const role = JOB_ROLES.find((r) => r.slug === roleSlug);
    if (!role) return { role: null, jobs: [] };

    const orFilter = role.patterns.map((p) => `title.ilike.%${p}%`).join(",");

    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("verified", true)
      .or(orFilter)
      .order("posted_at", { ascending: false })
      .limit(100);

    return { role, jobs: data || [] };
  },
  ["jobs-by-role"],
  { revalidate: 60, tags: ["jobs"] },
);

// --- /jobs/company/[company] ---
// Slug resolves to the ORIGINAL company name via a distinct list, then
// queries by exact match. Not scalable to millions, fine for hundreds.
async function resolveCompanyBySlug(
  companySlug: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("jobs")
    .select("company")
    .eq("verified", true);
  if (!data) return null;
  const uniques = new Set(data.map((j: any) => j.company).filter(Boolean));
  for (const c of uniques) {
    if (slugify(c) === companySlug) return c;
  }
  return null;
}

export const getJobsByCompany = unstable_cache(
  async (companySlug: string) => {
    const company = await resolveCompanyBySlug(companySlug);
    if (!company) return { company: null, jobs: [] };

    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("verified", true)
      .eq("company", company)
      .order("posted_at", { ascending: false })
      .limit(100);

    return { company, jobs: data || [] };
  },
  ["jobs-by-company"],
  { revalidate: 60, tags: ["jobs"] },
);

// --- /jobs/skills/[skill] ---
async function resolveSkillBySlug(skillSlug: string): Promise<string | null> {
  const { data } = await supabase
    .from("jobs")
    .select("skills")
    .eq("verified", true);
  if (!data) return null;
  const uniques = new Set<string>();
  for (const job of data) {
    for (const s of job.skills || []) uniques.add(s);
  }
  // Exact match on canonical slug
  for (const s of uniques) {
    if (slugify(s) === skillSlug) return s;
  }
  // Loose match — strip hyphens and dots so nodejs/node-js/node.js all resolve
  const loose = skillSlug.replace(/[-.]/g, "").toLowerCase();
  for (const s of uniques) {
    if (slugify(s).replace(/-/g, "").toLowerCase() === loose) return s;
  }
  return null;
}

export const getJobsBySkill = unstable_cache(
  async (skillSlug: string) => {
    const skill = await resolveSkillBySlug(skillSlug);
    if (!skill) return { skill: null, jobs: [] };

    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("verified", true)
      .contains("skills", [skill])
      .order("posted_at", { ascending: false })
      .limit(100);

    return { skill, jobs: data || [] };
  },
  ["jobs-by-skill"],
  { revalidate: 60, tags: ["jobs"] },
);

// --- /events/month/[month] ---
export const getEventsByMonth = unstable_cache(
  async (monthSlug: string) => {
    const range = monthRange(monthSlug);
    if (!range) return { events: [] };

    const { data } = await supabase
      .from("events")
      .select(
        `
        *,
        author:created_by (id, name, image)
      `,
      )
      .eq("verified", true)
      .gte("event_date", range.start)
      .lt("event_date", range.end)
      .order("event_date", { ascending: true })
      .limit(100);

    return { events: data || [] };
  },
  ["events-by-month"],
  { revalidate: 60, tags: ["events"] },
);

// --- /events/location/[city] ---
export const getEventsByCity = unstable_cache(
  async (citySlug: string) => {
    const city = EVENT_CITIES.find((c) => slugify(c) === citySlug);
    if (!city) return { city: null, events: [] };

    const { data } = await supabase
      .from("events")
      .select(
        `
        *,
        author:created_by (id, name, image)
      `,
      )
      .eq("verified", true)
      .ilike("location", `%${city}%`)
      .order("event_date", { ascending: true })
      .limit(100);

    return { city, events: data || [] };
  },
  ["events-by-city"],
  { revalidate: 60, tags: ["events"] },
);

// --- Taxonomies with >=3 items (for hub page chip links + sitemap) ---
export const getActiveJobTaxonomies = unstable_cache(
  async () => {
    const { data } = await supabase
      .from("jobs")
      .select("company, skills")
      .eq("verified", true);

    const companyCounts = new Map<string, number>();
    const skillCounts = new Map<string, number>();

    for (const job of data || []) {
      if (job.company) {
        const slug = slugify(job.company);
        companyCounts.set(slug, (companyCounts.get(slug) || 0) + 1);
      }
      for (const s of job.skills || []) {
        const slug = slugify(s);
        skillCounts.set(slug, (skillCounts.get(slug) || 0) + 1);
      }
    }

    return {
      companies: [...companyCounts.entries()]
        .filter(([, c]) => c >= 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([slug]) => slug),
      skills: [...skillCounts.entries()]
        .filter(([, c]) => c >= 3)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([slug]) => slug),
    };
  },
  ["active-job-taxonomies"],
  { revalidate: 60, tags: ["jobs"] },
);

export const getActiveEventTaxonomies = unstable_cache(
  async () => {
    // Months: past 6 + next 6
    const monthCounts = new Map<string, number>();
    const now = new Date();
    for (let i = -6; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const monthKey = `${y}-${m}`;
      const range = monthRange(monthKey);
      if (!range) continue;
      const { count } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("verified", true)
        .gte("event_date", range.start)
        .lt("event_date", range.end);
      if ((count || 0) >= 3) monthCounts.set(monthKey, count || 0);
    }

    // Cities
    const cities: string[] = [];
    for (const city of EVENT_CITIES) {
      const { count } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("verified", true)
        .ilike("location", `%${city}%`);
      if ((count || 0) >= 3) cities.push(slugify(city));
    }

    return {
      months: [...monthCounts.keys()].sort(),
      cities,
    };
  },
  ["active-event-taxonomies"],
  { revalidate: 60, tags: ["events"] },
);

// ============================================================================
// Redesign queries — sidebar counts, rail data, trending, recent supporters
// ============================================================================

const DISCORD_URL = "https://discord.gg/cQ5gxusATk";

export const getNavGlobal = unstable_cache(
  async () => {
    const { data, error } = await supabase.rpc("nav_counts");
    if (error) {
      console.error("nav_counts rpc error:", error);
      return { events_upcoming: 0, jobs_open: 0 };
    }
    return data as { events_upcoming: number; jobs_open: number };
  },
  ["nav-global"],
  { revalidate: 60, tags: ["events", "jobs"] },
);

export const getSavedCount = unstable_cache(
  async (userId: string) => {
    const { count } = await supabase
      .from("saves")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    return count || 0;
  },
  ["saved-count"],
  { revalidate: 60, tags: ["saves"] },
);

export async function getNavCounts(userId?: string) {
  const [global, saved] = await Promise.all([
    getNavGlobal(),
    userId ? getSavedCount(userId) : Promise.resolve(0),
  ]);
  return {
    events_upcoming: global.events_upcoming,
    jobs_open: global.jobs_open,
    saved_count: saved,
  };
}

export const getTrendingPosts = unstable_cache(
  async (limit = 5) => {
    const cutoff = new Date(Date.now() - 7 * 864e5)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const { data } = await supabase
      .from("lounge_posts")
      .select("id, title, score, comment_count, category")
      .gte("created_at", cutoff)
      .order("comment_count", { ascending: false })
      .order("score", { ascending: false })
      .limit(limit);
    return data || [];
  },
  ["trending-posts"],
  { revalidate: 60, tags: ["lounge"] },
);

export const getRecentSupporters = unstable_cache(
  async (limit = 5) => {
    const { data } = await supabase
      .from("donations")
      .select("id, name, amount, created_at")
      .eq("verified", true)
      .eq("show_on_leaderboard", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return data || [];
  },
  ["recent-supporters"],
  { revalidate: 60, tags: ["donations"] },
);

async function getSavedJobs(userId: string, limit: number) {
  const { data: saves } = await supabase
    .from("saves")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_type", "job")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!saves || saves.length === 0) return [];
  const ids = saves.map((s) => s.item_id);
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, company, location")
    .in("id", ids)
    .eq("verified", true);
  const byId = new Map((jobs || []).map((j) => [j.id, j]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

export const getCurrentMonthEvents = unstable_cache(
  async () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const { data } = await supabase
      .from("events")
      .select("id, title, event_date")
      .eq("verified", true)
      .gte("event_date", start.toISOString())
      .lt("event_date", end.toISOString())
      .order("event_date", { ascending: true });
    return data || [];
  },
  ["current-month-events"],
  { revalidate: 60, tags: ["events"] },
);

export type RailContext =
  | "home"
  | "lounge"
  | "events"
  | "jobs"
  | "projects"
  | "donate"
  | "utility";

export type RailBundle = {
  context: RailContext;
  prizePool?: Awaited<ReturnType<typeof getPrizePool>>;
  topProjects?: Awaited<ReturnType<typeof getRecentProducts>>;
  upcomingEvents?: Awaited<ReturnType<typeof getUpcomingEvents>>;
  newJobs?: Awaited<ReturnType<typeof getRecentJobs>>;
  trending?: Awaited<ReturnType<typeof getTrendingPosts>>;
  topDonors?: Awaited<ReturnType<typeof getTopDonators>>;
  recentSupporters?: Awaited<ReturnType<typeof getRecentSupporters>>;
};


export async function getRailData(
  context: RailContext,
  userId?: string,
): Promise<RailBundle> {
  switch (context) {
    case "home":
      return {
        context: "home",
        prizePool: await getPrizePool(),
        topProjects: await getRecentProducts(3),
        upcomingEvents: await getUpcomingEvents(3),
        newJobs: await getRecentJobs(3),
      };
    case "events":
      return {
        context: "events",
        prizePool: await getPrizePool(),
        topProjects: await getRecentProducts(3),
        trending: await getTrendingPosts(3),
        newJobs: await getRecentJobs(3),
      };
    case "jobs":
      return {
        context: "jobs",
        prizePool: await getPrizePool(),
        topProjects: await getRecentProducts(3),
        trending: await getTrendingPosts(3),
        upcomingEvents: await getUpcomingEvents(3),
      };
    case "projects":
      return {
        context: "projects",
        prizePool: await getPrizePool(),
        trending: await getTrendingPosts(3),
        upcomingEvents: await getUpcomingEvents(3),
        newJobs: await getRecentJobs(3),
      };
    case "lounge":
      return {
        context: "lounge",
        prizePool: await getPrizePool(),
        topProjects: await getRecentProducts(3),
        upcomingEvents: await getUpcomingEvents(3),
        newJobs: await getRecentJobs(3),
      };
    case "donate":
      return {
        context: "donate",
        prizePool: await getPrizePool(),
        topDonors: await getTopDonators(10),
        recentSupporters: await getRecentSupporters(5),
      };
    case "utility":
    default:
      return {
        context: "utility",
        prizePool: await getPrizePool(),
        topProjects: await getRecentProducts(3),
        upcomingEvents: await getUpcomingEvents(3),
        newJobs: await getRecentJobs(3),
      };
  }
}

export const getHomeStats = unstable_cache(
  async (userId?: string) => {
    const { data, error } = await supabase.rpc("home_stats", {
      p_user_id: userId ?? null,
    });
    if (error) {
      console.error("home_stats rpc error:", error);
      return {
        events_this_week: 0,
        jobs_24h: 0,
        posts_today: 0,
        projects_total: 0,
        saved_count: 0,
      };
    }
    return data as {
      events_this_week: number;
      jobs_24h: number;
      posts_today: number;
      projects_total: number;
      saved_count: number;
    };
  },
  ["home-stats"],
  { revalidate: 60, tags: ["events", "jobs", "lounge", "products", "saves"] },
);

export async function getSavedIds(
  userId: string | undefined,
  itemType: "post" | "event" | "job" | "project" | "scholarship",
): Promise<Set<string>> {
  if (!userId) return new Set();
  const { data } = await supabase
    .from("saves")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_type", itemType);
  return new Set((data || []).map((r) => r.item_id));
}

export const getSimilarEvents = unstable_cache(
  async (eventId: string, category: string | null, limit = 4) => {
    if (!category) return [];
    const { data } = await supabase
      .from("events")
      .select("id, title, event_date, category, location, image_url")
      .eq("verified", true)
      .eq("category", category)
      .neq("id", eventId)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(limit);
    return data || [];
  },
  ["similar-events"],
  { revalidate: 60, tags: ["events"] },
);

export const getEventsByOrganizer = unstable_cache(
  async (organizer: string | null, eventId: string, limit = 3) => {
    if (!organizer) return [];
    const { data } = await supabase
      .from("events")
      .select("id, title, event_date, category, location, image_url")
      .eq("verified", true)
      .eq("organizer", organizer)
      .neq("id", eventId)
      .order("event_date", { ascending: false })
      .limit(limit);
    return data || [];
  },
  ["events-by-organizer"],
  { revalidate: 60, tags: ["events"] },
);

export const getSimilarJobs = unstable_cache(
  async (jobId: string, employmentType: string | null, limit = 4) => {
    const nowISO = new Date().toISOString();
    let q = supabase
      .from("jobs")
      .select("id, title, company, location, employment_type, posted_at, image_url")
      .eq("verified", true)
      .neq("id", jobId)
      .or("application_ends_at.is.null,application_ends_at.gte." + nowISO)
      .order("posted_at", { ascending: false })
      .limit(limit);
    if (employmentType) q = q.ilike("employment_type", "%" + employmentType + "%");
    const { data } = await q;
    return data || [];
  },
  ["similar-jobs"],
  { revalidate: 60, tags: ["jobs"] },
);

export interface LoungeFeedParams {
  category: string;
  sort: "latest" | "top";
  page: number;
  pageSize: number;
  userId?: string;
}

export const getLoungeFeed = unstable_cache(
  async (f: LoungeFeedParams) => {
    const offset = (f.page - 1) * f.pageSize;
    let q = supabase
      .from("lounge_posts")
      .select(
        "id, title, content, category, created_at, updated_at, image_url, show_embed_image, redirect_url, score, comment_count, author_id, users:author_id(name, image)",
        { count: "exact" },
      );

    if (f.category !== "all") q = q.eq("category", f.category);

    if (f.sort === "top") {
      q = q.order("score", { ascending: false }).order("created_at", { ascending: false });
    } else {
      q = q.order("created_at", { ascending: false });
    }

    q = q.range(offset, offset + f.pageSize - 1);

    const { data, count } = await q;
    const posts = (data || []).map((p: any) => ({
      ...p,
      users: normalizeRelation(p.users),
    }));

    let myVotes: Record<string, 1 | -1> = {};
    let savedIds = new Set<string>();
    if (f.userId && posts.length > 0) {
      const ids = posts.map((p) => p.id);
      const [votesRes, savesRes] = await Promise.all([
        supabase
          .from("post_votes")
          .select("post_id, value")
          .eq("user_id", f.userId)
          .in("post_id", ids),
        supabase
          .from("saves")
          .select("item_id")
          .eq("user_id", f.userId)
          .eq("item_type", "post")
          .in("item_id", ids),
      ]);
      myVotes = Object.fromEntries(
        (votesRes.data || []).map((v: any) => [v.post_id, v.value]),
      );
      savedIds = new Set((savesRes.data || []).map((s: any) => s.item_id));
    }

    return {
      posts,
      totalCount: count || 0,
      myVotes,
      savedIds: Array.from(savedIds),
    };
  },
  ["lounge-feed"],
  { revalidate: 60, tags: ["lounge"] },
);

export const getPostVoteForUser = async (postId: string, userId: string) => {
  const { data } = await supabase
    .from("post_votes")
    .select("value")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();
  return data?.value as 1 | -1 | undefined;
};

export const getVerifiedDonationsLedger = unstable_cache(
  async (limit = 20) => {
    const { data } = await supabase
      .from("donations")
      .select("id, name, amount, created_at, verified_at")
      .eq("verified", true)
      .order("verified_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    return data || [];
  },
  ["verified-donations-ledger"],
  { revalidate: 60, tags: ["donations"] },
);

export interface SavedItem {
  type: "post" | "event" | "job" | "project" | "scholarship";
  data: any;
  savedAt: string;
}

export async function getSavedItemsFull(userId: string): Promise<SavedItem[]> {
  const { data: saves } = await supabase
    .from("saves")
    .select("item_type, item_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!saves || saves.length === 0) return [];

  const grouped: Record<string, string[]> = { post: [], event: [], job: [], project: [], scholarship: [] };
  for (const s of saves) {
    if (grouped[s.item_type]) grouped[s.item_type].push(s.item_id);
  }

  const [postsRes, eventsRes, jobsRes, projectsRes, scholarshipsRes] = await Promise.all([
    grouped.post.length > 0
      ? supabase
          .from("lounge_posts")
          .select("id, title, content, category, created_at, image_url, show_embed_image, users:author_id(name, image)")
          .in("id", grouped.post)
      : Promise.resolve({ data: [] as any[] }),
    grouped.event.length > 0
      ? supabase
          .from("events")
          .select("id, title, event_date, category, location, price, image_url")
          .eq("verified", true)
          .in("id", grouped.event)
      : Promise.resolve({ data: [] as any[] }),
    grouped.job.length > 0
      ? supabase
          .from("jobs")
          .select("id, title, company, location, employment_type, salary, posted_at, image_url")
          .eq("verified", true)
          .in("id", grouped.job)
      : Promise.resolve({ data: [] as any[] }),
    grouped.project.length > 0
      ? supabase
          .from("products")
          .select("id, name, description, url, image_url, votes")
          .in(
            "id",
            grouped.project.map((n) => Number(n)).filter((n) => !isNaN(n)),
          )
      : Promise.resolve({ data: [] as any[] }),
    grouped.scholarship.length > 0
      ? supabase
          .from("scholarships")
          .select("*")
          .eq("verified", true)
          .in("id", grouped.scholarship)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const postMap = new Map(
    (postsRes.data || []).map((p: any) => [p.id, { ...p, users: normalizeRelation(p.users) }]),
  );
  const eventMap = new Map((eventsRes.data || []).map((e: any) => [e.id, e]));
  const jobMap = new Map((jobsRes.data || []).map((j: any) => [j.id, j]));
  const projectMap = new Map((projectsRes.data || []).map((p: any) => [String(p.id), p]));
  const scholarshipMap = new Map((scholarshipsRes.data || []).map((s: any) => [String(s.id), s]));

  const items: SavedItem[] = [];
  for (const s of saves) {
    let data: any = null;
    if (s.item_type === "post") data = postMap.get(s.item_id);
    else if (s.item_type === "event") data = eventMap.get(s.item_id);
    else if (s.item_type === "job") data = jobMap.get(s.item_id);
    else if (s.item_type === "project") data = projectMap.get(s.item_id);
    else if (s.item_type === "scholarship") data = scholarshipMap.get(s.item_id);
    if (data) {
      items.push({
        type: s.item_type as SavedItem["type"],
        data,
        savedAt: s.created_at,
      });
    }
  }

  return items;
}

export async function getAdminOverview() {
  const [
    { count: totalEvents },
    { count: pendingEvents },
    { count: totalProducts },
    { count: pendingProducts },
    { count: totalUsers },
    { count: openReports },
    { data: recentDonations },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }).eq("verified", true),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("verified", false),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("approved", true),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("approved", false),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }),
    supabase
      .from("donations")
      .select("id, name, amount, verified_at")
      .eq("verified", true)
      .order("verified_at", { ascending: false, nullsFirst: false })
      .limit(5),
  ]);

  return {
    totalEvents: totalEvents || 0,
    pendingEvents: pendingEvents || 0,
    totalProducts: totalProducts || 0,
    pendingProducts: pendingProducts || 0,
    totalUsers: totalUsers || 0,
    openReports: openReports || 0,
    recentDonations: recentDonations || [],
  };
}

// ============================================================================
// SCHOLARSHIP QUERIES
// ============================================================================

export type ScholarshipDeadlineStatus =
  | "parsed"
  | "estimated-year-only"
  | "rolling"
  | "unknown";

export interface Scholarship {
  id: string;
  title: string;
  description: string | null;
  provider: string | null;
  deadline_parsed: string | null;
  deadline_status: ScholarshipDeadlineStatus;
  deadline_display: string | null;
  funding_type: string | null;
  funding_amount: string | null;
  degree_level: string | null;
  field_of_study: string | null;
  image_url: string | null;
  tags: string[];
  apply_url: string | null;
  source_url: string | null;
  source: string | null;
  verified: boolean;
  first_seen_at: string;
  posted_at: string;
}

export interface ScholarshipFilters {
  q: string;
  degree: string;
  country: string;
  status: string;
  sort: "new" | "closing";
  page: number;
  pageSize: number;
}

export const getScholarshipsPage = unstable_cache(
  async (f: ScholarshipFilters) => {
    const offset = (f.page - 1) * f.pageSize;
    let q = supabase
      .from("scholarships")
      .select("*", { count: "exact" })
      .eq("verified", true);

    if (f.q) {
      const safe = f.q.replace(/[%_\\]/g, "\\$&");
      q = q.ilike("title", "%" + safe + "%");
    }
    if (f.degree !== "any") {
      q = q.ilike("degree_level", "%" + f.degree + "%");
    }
    if (f.country !== "any") {
      q = q.contains("tags", [f.country]);
    }
    if (f.status !== "any" && f.sort !== "closing") {
      q = q.eq("deadline_status", f.status);
    }

    if (f.sort === "closing") {
      q = q
        .eq("deadline_status", "parsed")
        .gte("deadline_parsed", new Date().toISOString().slice(0, 10))
        .order("deadline_parsed", { ascending: true, nullsFirst: false });
    } else {
      q = q.order("posted_at", { ascending: false });
    }

    q = q.range(offset, offset + f.pageSize - 1);

    const { data, count } = await q;
    return {
      scholarships: (data || []) as Scholarship[],
      totalCount: count || 0,
    };
  },
  ["scholarships-page-v1"],
  { revalidate: 60, tags: ["scholarships"] },
);






// ============================================================================
// DAILY ACTIVITY QUERY
// ============================================================================

export interface DailyActivity {
  date: string;
  events: number;
  jobs: number;
  scholarships: number;
}

export const getDailyActivity = unstable_cache(
  async (days = 60): Promise<DailyActivity[]> => {
    const cutoff = new Date(Date.now() - days * 864e5).toISOString();
    const [{ data: events }, { data: jobs }, { data: scholarships }] = await Promise.all([
      supabase
        .from("events")
        .select("created_at")
        .eq("verified", true)
        .gte("created_at", cutoff),
      supabase
        .from("jobs")
        .select("posted_at")
        .eq("verified", true)
        .gte("posted_at", cutoff),
      supabase
        .from("scholarships")
        .select("posted_at")
        .eq("verified", true)
        .gte("posted_at", cutoff),
    ]);

    const buckets = new Map<string, DailyActivity>();
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 864e5);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, { date: key, events: 0, jobs: 0, scholarships: 0 });
    }

    const bumpEvents = (rows: { created_at: string | null }[] | null) => {
      for (const r of rows || []) {
        if (!r.created_at) continue;
        const key = r.created_at.slice(0, 10);
        const b = buckets.get(key);
        if (b) b.events += 1;
      }
    };
    const bumpJobs = (rows: { posted_at: string | null }[] | null) => {
      for (const r of rows || []) {
        if (!r.posted_at) continue;
        const key = r.posted_at.slice(0, 10);
        const b = buckets.get(key);
        if (b) b.jobs += 1;
      }
    };
    const bumpSch = (rows: { posted_at: string | null }[] | null) => {
      for (const r of rows || []) {
        if (!r.posted_at) continue;
        const key = r.posted_at.slice(0, 10);
        const b = buckets.get(key);
        if (b) b.scholarships += 1;
      }
    };

    bumpEvents(events as { created_at: string | null }[] | null);
    bumpJobs(jobs as { posted_at: string | null }[] | null);
    bumpSch(scholarships as { posted_at: string | null }[] | null);

    return [...buckets.values()];
  },
  ["daily-activity"],
  { revalidate: 60, tags: ["events", "jobs", "scholarships"] },
);






// ============================================================================
// TECH SKILL DEMAND (curated whitelist)
// ============================================================================
// Raw skills scraped from job boards are noisy — hundreds of unique strings,
// most of them one-offs or filler. Instead of "discover" skills from data,
// we track a curated list of tech skills by matching against known aliases.
// No spammer can inflate a skill's rank by posting 40 jobs with the same tag,
// because we only count the skill if it's actually a real tech skill.

export interface TechSkillRow {
  skill: string;
  jobs: number;
  companies: number;
}

const TECH_SKILL_ALIASES: Record<string, string[]> = {
  "React": ["react", "react.js", "reactjs", "react js"],
  "Next.js": ["next.js", "nextjs", "next js"],
  "Node.js": ["node.js", "nodejs", "node js", "node"],
  "JavaScript": ["javascript", "js"],
  "TypeScript": ["typescript", "ts"],
  "Python": ["python"],
  "Django": ["django"],
  "Flask": ["flask"],
  "PHP": ["php"],
  "Laravel": ["laravel"],
  "Java": ["java"],
  "Kotlin": ["kotlin"],
  "Swift": ["swift"],
  "C++": ["c++", "cpp"],
  "C#": ["c#", "csharp"],
  "Go": ["golang", " go "],
  "Rust": ["rust"],
  "Flutter": ["flutter"],
  "React Native": ["react native"],
  "Angular": ["angular"],
  "Vue": ["vue", "vue.js", "vuejs"],
  "SQL": ["sql", "mysql", "postgresql", "postgres", "sqlite"],
  "MongoDB": ["mongodb", "mongo"],
  "Redis": ["redis"],
  "GraphQL": ["graphql"],
  "REST API": ["rest api", "restful", "rest apis", "rest"],
  "AWS": ["aws", "amazon web services"],
  "Azure": ["azure"],
  "GCP": ["gcp", "google cloud"],
  "Docker": ["docker"],
  "Kubernetes": ["kubernetes", "k8s"],
  "Git": ["git", "github", "gitlab"],
  "Linux": ["linux", "ubuntu"],
  "Firebase": ["firebase"],
  "Tailwind": ["tailwind", "tailwindcss", "tailwind css"],
  "Figma": ["figma"],
  "TensorFlow": ["tensorflow"],
  "PyTorch": ["pytorch"],
  "Pandas": ["pandas"],
  "Express": ["express", "express.js", "expressjs"],
};

export const getTechSkillDemand = unstable_cache(
  async (limit = 8, days = 60): Promise<TechSkillRow[]> => {
    const cutoff = new Date(Date.now() - days * 864e5).toISOString();
    const { data } = await supabase
      .from("jobs")
      .select("company, skills")
      .eq("verified", true)
      .gte("posted_at", cutoff);

    // canonical skill -> { companies: Set, jobs: number }
    const agg = new Map<string, { companies: Set<string>; jobs: number }>();
    for (const canonical of Object.keys(TECH_SKILL_ALIASES)) {
      agg.set(canonical, { companies: new Set(), jobs: 0 });
    }

    for (const row of data || []) {
      const company = ((row.company as string | null) || "").trim().toLowerCase();
      const skills = (row.skills as string[]) || [];
      const matchedThisJob = new Set<string>();

      for (const raw of skills) {
        const s = (" " + (raw || "").toLowerCase() + " ").trim();
        if (!s) continue;
        for (const [canonical, aliases] of Object.entries(TECH_SKILL_ALIASES)) {
          if (matchedThisJob.has(canonical)) continue;
          for (const alias of aliases) {
            const needle = alias.startsWith(" ") ? alias : ` ${alias} `;
            if (s.includes(needle) || s === alias) {
              matchedThisJob.add(canonical);
              break;
            }
          }
        }
      }

      for (const canonical of matchedThisJob) {
        const entry = agg.get(canonical)!;
        entry.jobs += 1;
        if (company) entry.companies.add(company);
      }
    }

    return [...agg.entries()]
      .filter(([, e]) => e.jobs > 0)
      .map(([skill, e]) => ({
        skill,
        jobs: e.jobs,
        companies: e.companies.size,
      }))
      .sort((a, b) => {
        if (b.companies !== a.companies) return b.companies - a.companies;
        if (b.jobs !== a.jobs) return b.jobs - a.jobs;
        return a.skill.localeCompare(b.skill);
      })
      .slice(0, limit);
  },
  ["tech-skill-demand"],
  { revalidate: 60, tags: ["jobs"] },
);

export const getScholarships24h = unstable_cache(
  async () => {
    const cutoff = new Date(Date.now() - 864e5).toISOString();
    const { count } = await supabase
      .from("scholarships")
      .select("*", { count: "exact", head: true })
      .eq("verified", true)
      .gte("posted_at", cutoff);
    return count || 0;
  },
  ["scholarships-24h"],
  { revalidate: 60, tags: ["scholarships"] },
);

export const getScholarshipById = unstable_cache(
  async (id: string) => {
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .eq("id", id)
      .eq("verified", true)
      .single();
    return (data as Scholarship) || null;
  },
  ["scholarship-by-id"],
  { revalidate: 60, tags: ["scholarships"] },
);

// --- Scholarship pSEO queries ---
import {
  SCHOLARSHIP_COUNTRIES,
  SCHOLARSHIP_LEVELS,
} from "@/app/lib/scholarshipSeo";

export const getActiveScholarshipCountries = unstable_cache(
  async () => {
    const { data } = await supabase
      .from("scholarships")
      .select("tags")
      .eq("verified", true);
    const counts = new Map<string, number>();
    for (const s of data || []) {
      for (const t of (s.tags as string[]) || []) {
        if (SCHOLARSHIP_COUNTRIES.includes(t)) {
          counts.set(t, (counts.get(t) || 0) + 1);
        }
      }
    }
    return Array.from(counts.entries())
      .filter(([, c]) => c >= 3)
      .map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  },
  ["scholarship-countries"],
  { revalidate: 60, tags: ["scholarships"] },
);

export const getScholarshipsByCountry = unstable_cache(
  async (countrySlug: string) => {
    const country = SCHOLARSHIP_COUNTRIES.find(
      (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === countrySlug,
    );
    if (!country) return { country: null, scholarships: [] };
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .eq("verified", true)
      .contains("tags", [country])
      .order("posted_at", { ascending: false })
      .limit(100);
    return { country, scholarships: (data || []) as Scholarship[] };
  },
  ["scholarships-by-country"],
  { revalidate: 60, tags: ["scholarships"] },
);

export const getActiveScholarshipLevels = unstable_cache(
  async () => {
    const { data } = await supabase
      .from("scholarships")
      .select("degree_level")
      .eq("verified", true);
    const counts = new Map<string, number>();
    for (const s of data || []) {
      const dl = (s.degree_level as string | null) || "";
      const dlLower = dl.toLowerCase();
      for (const lvl of SCHOLARSHIP_LEVELS) {
        const needle = lvl.pattern.replace(/%/g, "").toLowerCase();
        if (dlLower.includes(needle)) {
          counts.set(lvl.slug, (counts.get(lvl.slug) || 0) + 1);
        }
      }
    }
    return SCHOLARSHIP_LEVELS
      .filter((l) => (counts.get(l.slug) || 0) >= 3)
      .map((l) => ({ ...l, count: counts.get(l.slug) || 0 }));
  },
  ["scholarship-levels"],
  { revalidate: 60, tags: ["scholarships"] },
);

export const getScholarshipsByLevel = unstable_cache(
  async (levelSlug: string) => {
    const level = SCHOLARSHIP_LEVELS.find((l) => l.slug === levelSlug);
    if (!level) return { level: null, scholarships: [] };
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .eq("verified", true)
      .ilike("degree_level", level.pattern)
      .order("posted_at", { ascending: false })
      .limit(100);
    return { level, scholarships: (data || []) as Scholarship[] };
  },
  ["scholarships-by-level"],
  { revalidate: 60, tags: ["scholarships"] },
);


// ============================================================================
// CLOSING SOON SCHOLARSHIPS
// ============================================================================

export interface ClosingSoonRow {
  id: string;
  title: string;
  deadline_display: string | null;
  deadline_parsed: string;
  degree_level: string | null;
}

export const getClosingSoonScholarships = unstable_cache(
  async (limit = 4): Promise<ClosingSoonRow[]> => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("scholarships")
      .select("id, title, deadline_display, deadline_parsed, degree_level")
      .eq("verified", true)
      .eq("deadline_status", "parsed")
      .gte("deadline_parsed", today)
      .order("deadline_parsed", { ascending: true, nullsFirst: false })
      .limit(limit);
    return (data || []) as ClosingSoonRow[];
  },
  ["closing-soon"],
  { revalidate: 60, tags: ["scholarships"] },
);

// ============================================================================
// WEEKDAY PATTERN (events + jobs)
// ============================================================================

export interface WeekdayBucket {
  dow: number;
  label: string;
  events: number;
  jobs: number;
}

export interface WeekdayPattern {
  buckets: WeekdayBucket[];
  totalEvents: number;
  totalJobs: number;
  today: number;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dowNPT(iso: string): number {
  const d = new Date(iso);
  const shifted = new Date(d.getTime() + 5 * 3600e3 + 45 * 60e3);
  return shifted.getUTCDay();
}

export const getWeekdayPattern = unstable_cache(
  async (days = 90): Promise<WeekdayPattern> => {
    const now = new Date();
    const startISO = now.toISOString();
    const endISO = new Date(now.getTime() + days * 864e5).toISOString();

    const [{ data: events }, { data: jobs }] = await Promise.all([
      supabase
        .from("events")
        .select("event_date")
        .eq("verified", true)
        .gte("event_date", startISO)
        .lte("event_date", endISO),
      supabase
        .from("jobs")
        .select("posted_at")
        .eq("verified", true)
        .gte("posted_at", startISO)
        .lte("posted_at", endISO),
    ]);

    const buckets: WeekdayBucket[] = WEEKDAY_LABELS.map((label, dow) => ({
      dow,
      label,
      events: 0,
      jobs: 0,
    }));

    for (const row of events || []) {
      const ed = row.event_date as string | null;
      if (!ed) continue;
      buckets[dowNPT(ed)].events += 1;
    }
    for (const row of jobs || []) {
      const pd = row.posted_at as string | null;
      if (!pd) continue;
      buckets[dowNPT(pd)].jobs += 1;
    }

    const todayDow = dowNPT(now.toISOString());

    return {
      buckets,
      totalEvents: buckets.reduce((n, b) => n + b.events, 0),
      totalJobs: buckets.reduce((n, b) => n + b.jobs, 0),
      today: todayDow,
    };
  },
  ["weekday-pattern"],
  { revalidate: 60, tags: ["events", "jobs"] },
);
