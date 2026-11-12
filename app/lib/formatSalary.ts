function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    const s = Number.isInteger(k) ? String(k) : k.toFixed(1).replace(/\.0$/, "");
    return s + "k";
  }
  const m = n / 1_000_000;
  const s = Number.isInteger(m) ? String(m) : m.toFixed(1).replace(/\.0$/, "");
  return s + "M";
}

function toNum(s: string): number {
  return Number(s.replace(/,/g, ""));
}

export function formatSalary(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "Not disclosed";
  const s = raw.trim();

  if (/negotiable/i.test(s)) return "Negotiable";
  if (/not\s*disclosed/i.test(s)) return "Not disclosed";

  let period = "";
  if (/\byear|annual|yr\b/i.test(s)) period = "/yr";
  else if (/month|mo\b/i.test(s)) period = "/mo";

  const rangeMatch = s.match(/(\d[\d,]*(?:\.\d+)?)\s*[-–]\s*(\d[\d,]*(?:\.\d+)?)/);
  if (rangeMatch) {
    const lo = compact(toNum(rangeMatch[1]));
    const hi = compact(toNum(rangeMatch[2]));
    return `NPR ${lo}–${hi}${period}`;
  }

  const single = s.match(/(\d[\d,]*(?:\.\d+)?)/);
  if (single) return `NPR ${compact(toNum(single[1]))}${period}`;

  return s;
}

export function isSalaryDisclosed(raw: string | null | undefined): boolean {
  if (!raw || !raw.trim()) return false;
  if (/negotiable|not\s*disclosed/i.test(raw)) return false;
  return /\d/.test(raw);
}
