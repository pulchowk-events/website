export function formatSalary(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "Not disclosed";
  const s = raw.trim();

  if (/negotiable/i.test(s)) return "Negotiable";
  if (/not\s*disclosed/i.test(s)) return "Not disclosed";

  const rangeMatch = s.match(/(\d[\d,]*(?:\.\d+)?)\s*[-–]\s*(\d[\d,]*(?:\.\d+)?)/);
  let period = "";
  if (/\byear|annual|yr\b/i.test(s)) period = " / year";
  else if (/month|mo\b/i.test(s)) period = " / month";

  if (rangeMatch) return `NPR ${rangeMatch[1]} – ${rangeMatch[2]}${period}`;
  const single = s.match(/(\d[\d,]*(?:\.\d+)?)/);
  if (single) return `NPR ${single[1]}${period}`;

  return s;
}

export function isSalaryDisclosed(raw: string | null | undefined): boolean {
  if (!raw || !raw.trim()) return false;
  if (/negotiable|not\s*disclosed/i.test(raw)) return false;
  return /\d/.test(raw);
}
