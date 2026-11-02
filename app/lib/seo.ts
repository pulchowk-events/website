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
