// Normalize scraped description text into parseable Markdown.
// Scraped sources frequently deliver everything on one line with `•`
// separators and inline "Header:" labels. That renders as a single
// wall of text. This inserts paragraph and list breaks so React-Markdown
// produces proper <p> and <ul> output.
//
// Idempotent and safe on already-formatted Markdown: if the text has
// both blank-line paragraphs AND a markdown list, it's returned as-is.

const LABELED_BULLET = /([A-Z][A-Za-z][A-Za-z0-9 /&'()\-]{0,48}):\s*[•·]\s+/g;

export function normalizeScrapedText(raw: string | null | undefined): string {
  if (!raw) return "";
  const text = raw.replace(/\r\n?/g, "\n");

  const hasMarkdownList = /(^|\n)[-*]\s+\S/.test(text);
  const hasParagraphs = /\n\s*\n/.test(text);
  if (hasMarkdownList && hasParagraphs) return text;

  let s = text;

  // "Responsibilities: • item • item" → "Responsibilities:\n\n- item\n- item"
  s = s.replace(LABELED_BULLET, (_m, label: string) => `${label.trim()}:\n\n- `);

  // Remaining bullets → list items
  s = s.replace(/\s*[•·]\s*/g, "\n- ");

  // Normalize whitespace: no trailing spaces, no triple newlines, trim edges
  s = s
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Strip a stray list marker at the very start (if the text began with •)
  s = s.replace(/^-\s+/, "");

  return s;
}
