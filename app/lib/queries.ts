import { unstable_cache } from "next/cache";
import { supabase } from "@/app/lib/supabase";

// ============================================================================
// EVENT QUERIES
// ============================================================================

export const getEventsPage = unstable_cache(
  async (
    tab: "upcoming" | "past",
    category: string,
    page: number,
    pageSize: number,
  ) => {
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

    q = q.range(offset, offset + pageSize - 1);

    const { data, count } = await q;
    return { events: data || [], totalCount: count || 0 };
  },
  ["events-page"],
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
    return data;
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
        id, title, event_date, category,
        author:created_by (name, image)
      `,
      )
      .eq("verified", true)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(limit);
    return data || [];
  },
  ["upcoming-events"],
  { revalidate: 60, tags: ["events"] },
);

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

export const getApprovedProducts = unstable_cache(
  async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });
    return data || [];
  },
  ["approved-products"],
  { revalidate: 60, tags: ["products"] },
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const { data } = await supabase
      .from("products")
      .select(
        "id, name, description, url, created_at, posted_by, image_url, redirect_url",
      )
      .eq("url", slug)
      .single();
    return data;
  },
  ["product-by-slug"],
  { revalidate: 60, tags: ["products"] },
);

export const getRecentProducts = unstable_cache(
  async (limit = 3) => {
    const { data } = await supabase
      .from("products")
      .select("id, name, image_url, created_at, url")
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
        users:author_id (name, image)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    return data || [];
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
        users:author_id (name, image, email, id)
      `,
      )
      .eq("id", id)
      .single();
    return data;
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
// AGGREGATED SIDEBAR (used by events, product-hunt, about, home, search)
// ============================================================================
// This is the single biggest perf win: previously each page re-fetched
// donors + products + upcoming events independently. Now all pages share
// one cache entry per 60s window.

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
