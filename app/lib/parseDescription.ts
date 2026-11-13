import { normalizeScrapedText } from "./smartText";

export interface DescriptionSection {
  title: string;
  body: string;
}

// Conservative list of section headers scrapers actually emit.
// Anything not in this list, and not matched by a strong structural pattern,
// stays inline as plain paragraph text — no random "Location: Kathmandu"
// lines getting promoted to sections.
const KNOWN_HEADERS = [
  // Jobs
  "about the role", "about you", "about us", "about the company",
  "role", "overview", "description", "job description",
  "responsibilities", "duties", "key responsibilities", "what you'll do",
  "requirements", "qualifications", "skills", "skill requirements",
  "what we're looking for", "who we're looking for",
  "nice to have", "bonus", "benefits", "what we offer", "perks",
  "compensation", "how to apply", "to apply", "application",
  "application process", "application deadline",
  // Events
  "about", "details", "schedule", "speakers", "venue", "agenda",
  "pricing", "registration", "tickets", "what to expect",
  // Scholarships
  "eligibility", "coverage", "funding", "fields of study",
  "about the program", "program details", "application requirements",
];

const KNOWN_SET = new Set(KNOWN_HEADERS.map((h) => h.toLowerCase()));

function looksLikeHeader(line: string): string | null {
  const t = line.trim();
  if (!t || t.length > 60) return null;

  // Markdown H2/H3
  const mdx = t.match(/^#{2,3}\s+(.+)$/);
  if (mdx) return mdx[1].trim();

  // All-caps standalone line, 2-4 words ("RESPONSIBILITIES", "WHAT WE OFFER")
  if (/^[A-Z][A-Z &'\-]{3,40}$/.test(t) && t.split(/\s+/).length <= 4) {
    return t.charAt(0) + t.slice(1).toLowerCase();
  }

  // Strip trailing colon
  const clean = t.replace(/[:：]\s*$/, "").trim();
  const lower = clean.toLowerCase();

  // Exact match against known set
  if (KNOWN_SET.has(lower)) return clean;

  // Title Case ending with colon, 1-4 words ("Perks:", "About You:")
  if (/:$/.test(t) && clean.split(/\s+/).length <= 4 && /^[A-Z]/.test(clean)) {
    return clean;
  }

  return null;
}

export function parseDescription(
  raw: string | null | undefined,
): DescriptionSection[] | null {
  if (!raw) return null;
  const text = normalizeScrapedText(raw);
  if (!text) return null;

  const lines = text.split("\n");
  const sections: DescriptionSection[] = [];
  let current: DescriptionSection = { title: "", body: "" };

  for (const line of lines) {
    const header = looksLikeHeader(line);
    if (header) {
      if (current.title || current.body.trim()) {
        sections.push({ ...current, body: current.body.trim() });
      }
      current = { title: header, body: "" };
    } else {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  if (current.title || current.body.trim()) {
    sections.push({ ...current, body: current.body.trim() });
  }

  // No structure found → caller falls back to plain Markdown
  if (sections.length < 2) return null;

  // Too short to warrant structure — reads better as prose
  const totalChars = sections.reduce(
    (n, s) => n + s.title.length + s.body.length,
    0,
  );
  if (totalChars < 200) return null;

  // Drop empty sections
  const cleaned = sections.filter((s) => s.title || s.body.trim());
  if (cleaned.length < 2) return null;

  return cleaned;
}
