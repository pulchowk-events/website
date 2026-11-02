import { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/app/lib/supabase-server";
import { SITE_URL } from "@/app/lib/seo";

const PAGE_SIZE = 24;
const MAX_EVENT_PAGES = 5;
const MAX_PAST_PAGES = 3;
const CATEGORIES = [
  "software",
  "gaming",
  "hardware",
  "music",
  "sports",
  "extra",
];

// Escape XML entities in URLs before Next.js writes them into <loc>.
// XML treats `&` as the start of an entity reference — a URL with
// `?tab=past&page=2` inside <loc> breaks the whole sitemap with
// "EntityRef: expecting ';'" until every `&` is written as `&amp;`.
// Search engines decode `&amp;` back to `&`, so the URL is preserved exactly.
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function url(
  loc: string,
  opts: Partial<MetadataRoute.Sitemap[number]> = {},
): MetadataRoute.Sitemap[number] {
  return {
    url: escapeXml(loc),
    lastModified: opts.lastModified || new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient();
  const nowISO = new Date().toISOString();

  const [
    { data: events },
    { data: products },
    { data: loungePosts },
    { data: jobs }, // ← ADD
    { count: upcomingCount },
    { count: pastCount },
    { count: jobsCount }, // ← ADD
  ] = await Promise.all([
    supabase
      .from("events")
      .select("id, event_date, created_at")
      .eq("verified", true)
      .order("event_date", { ascending: false }),
    supabase.from("products").select("url, created_at").eq("approved", true),
    supabase.from("lounge_posts").select("id, created_at, updated_at"),
    // ← ADD:
    supabase
      .from("jobs")
      .select("id, posted_at")
      .eq("verified", true)
      .order("posted_at", { ascending: false }),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("verified", true)
      .gte("event_date", nowISO),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("verified", true)
      .lt("event_date", nowISO),
    // ← ADD:
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("verified", true),
  ]);

  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // ── Static pages ──
  entries.push(
    url(SITE_URL, {
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    }),
    url(`${SITE_URL}/events`, {
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    }),
    url(`${SITE_URL}/product-hunt`, {
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    }),
    url(`${SITE_URL}/lounge`, {
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    }),
    url(`${SITE_URL}/about`, {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
    url(`${SITE_URL}/donate`, {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }),
  );

  // ── Event pagination (upcoming) ──
  const upcomingPages = Math.min(
    MAX_EVENT_PAGES,
    Math.ceil((upcomingCount || 0) / PAGE_SIZE),
  );
  for (let p = 2; p <= upcomingPages; p++) {
    entries.push(
      url(`${SITE_URL}/events?page=${p}`, {
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.7,
      }),
    );
  }

  // ── Past tab (base + pagination) ──
  entries.push(
    url(`${SITE_URL}/events?tab=past`, {
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    }),
  );
  const pastPages = Math.min(
    MAX_PAST_PAGES,
    Math.ceil((pastCount || 0) / PAGE_SIZE),
  );
  for (let p = 2; p <= pastPages; p++) {
    entries.push(
      url(`${SITE_URL}/events?tab=past&page=${p}`, {
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.5,
      }),
    );
  }

  // ── Category landing pages (upcoming + past) ──
  for (const cat of CATEGORIES) {
    entries.push(
      url(`${SITE_URL}/events?category=${cat}`, {
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.6,
      }),
    );
    entries.push(
      url(`${SITE_URL}/events?tab=past&category=${cat}`, {
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.4,
      }),
    );
  }

  // ── Detail pages ──
  for (const event of events || []) {
    entries.push(
      url(`${SITE_URL}/events/${event.id}`, {
        lastModified: new Date(event.created_at || event.event_date),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    );
  }
  for (const product of products || []) {
    entries.push(
      url(`${SITE_URL}/product-hunt/${product.url}`, {
        lastModified: new Date(product.created_at),
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    );
  }
  for (const post of loungePosts || []) {
    entries.push(
      url(`${SITE_URL}/lounge/${post.id}`, {
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    );
  }

  // Jobs pages
  entries.push(
    url(`${SITE_URL}/jobs`, {
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    }),
  );

  // Jobs pagination
  const JOBS_PAGE_SIZE = 20;
  const jobsPages = Math.min(5, Math.ceil((jobsCount || 0) / JOBS_PAGE_SIZE));
  for (let p = 2; p <= jobsPages; p++) {
    entries.push(
      url(`${SITE_URL}/jobs?page=${p}`, {
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.7,
      }),
    );
  }

  // Job filters (SEO landing pages)
  const JOB_TYPES = [
    "full-time",
    "part-time",
    "internship",
    "contract",
    "freelance",
  ];
  const JOB_LOCATIONS = [
    "Kathmandu",
    "Lalitpur",
    "Bhaktapur",
    "Pokhara",
    "Remote",
  ];
  for (const t of JOB_TYPES) {
    entries.push(
      url(`${SITE_URL}/jobs?type=${t}`, {
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.6,
      }),
    );
  }
  for (const l of JOB_LOCATIONS) {
    entries.push(
      url(`${SITE_URL}/jobs?location=${l}`, {
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.6,
      }),
    );
  }

  // Job detail pages
  for (const job of jobs || []) {
    entries.push(
      url(`${SITE_URL}/jobs/${job.id}`, {
        lastModified: new Date(job.posted_at || new Date()),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    );
  }

  return entries;
}
