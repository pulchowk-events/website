export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://pulchowkevents.netlify.app";

export const SITE_NAME = "Pulchowk Events";

export const DEFAULT_DESCRIPTION =
  "Discover, share, and manage campus events and student projects across Nepal. Browse upcoming events, vote on projects, and connect with the community.";

export function breadcrumbSchema(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

// ============================================================================
// pSEO TAXONOMIES
// ============================================================================

// Predefined role taxonomy for /jobs/role/[role].
// Each role has multiple patterns so "backend", "back-end", "back end" all
// match without needing separate URLs. Sorted roughly by search volume.
export const JOB_ROLES = [
  {
    slug: "software-engineer",
    label: "Software Engineer",
    patterns: ["software engineer", "software developer"],
  },
  {
    slug: "backend",
    label: "Backend",
    patterns: [
      "backend",
      "back-end",
      "back end",
      "server developer",
      "api developer",
    ],
  },
  {
    slug: "frontend",
    label: "Frontend",
    patterns: [
      "frontend",
      "front-end",
      "front end",
      "ui developer",
      "ui engineer",
    ],
  },
  {
    slug: "full-stack",
    label: "Full Stack",
    patterns: ["full stack", "fullstack", "full-stack"],
  },
  {
    slug: "react",
    label: "React",
    patterns: ["react developer", "react engineer", "reactjs", "react.js"],
  },
  {
    slug: "node-js",
    label: "Node.js",
    patterns: ["node developer", "nodejs", "node.js", "node engineer"],
  },
  {
    slug: "python",
    label: "Python",
    patterns: ["python developer", "python engineer"],
  },
  {
    slug: "java",
    label: "Java",
    patterns: ["java developer", "java engineer"],
  },
  {
    slug: "php",
    label: "PHP",
    patterns: ["php developer", "php engineer", "laravel developer"],
  },
  {
    slug: "flutter",
    label: "Flutter",
    patterns: ["flutter developer", "flutter engineer"],
  },
  {
    slug: "android",
    label: "Android",
    patterns: ["android developer", "android engineer"],
  },
  {
    slug: "ios",
    label: "iOS",
    patterns: ["ios developer", "ios engineer", "swift developer"],
  },
  {
    slug: "devops",
    label: "DevOps",
    patterns: ["devops", "dev ops", "site reliability engineer", "sre"],
  },
  {
    slug: "data-science",
    label: "Data Science",
    patterns: [
      "data scientist",
      "data science",
      "machine learning engineer",
      "ml engineer",
    ],
  },
  {
    slug: "data-analyst",
    label: "Data Analyst",
    patterns: ["data analyst", "business analyst", "bi analyst"],
  },
  {
    slug: "ui-ux",
    label: "UI/UX Designer",
    patterns: [
      "ui/ux designer",
      "ux designer",
      "ui designer",
      "product designer",
    ],
  },
  {
    slug: "qa",
    label: "QA Engineer",
    patterns: [
      "qa engineer",
      "qa analyst",
      "quality assurance engineer",
      "software tester",
    ],
  },
  {
    slug: "digital-marketing",
    label: "Digital Marketing",
    patterns: ["digital marketing", "seo specialist", "content marketing"],
  },
] as const;

// Known cities for /events/location/[city]. Kept short — long-tail cities
// won't have enough events to pass the quality gate anyway.
export const EVENT_CITIES = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Remote",
];

// ============================================================================
// SLUG HELPERS
// ============================================================================
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deslugify(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// 'yyyy-mm' → 'November 2026'
export function formatMonthSlug(slug: string): string | null {
  const match = slug.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const [_, y, m] = match;
  const monthIndex = parseInt(m, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  const date = new Date(parseInt(y, 10), monthIndex, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// 'yyyy-mm' → { start: ISO, end: ISO }
export function monthRange(
  slug: string,
): { start: string; end: string } | null {
  const match = slug.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10) - 1;
  if (m < 0 || m > 11) return null;
  const start = new Date(Date.UTC(y, m, 1)).toISOString();
  const end = new Date(Date.UTC(y, m + 1, 1)).toISOString();
  return { start, end };
}
