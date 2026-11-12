"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  contract: "Contract",
  freelance: "Freelance",
};

const LOC_LABELS: Record<string, string> = {
  kathmandu: "Kathmandu",
  lalitpur: "Lalitpur",
  bhaktapur: "Bhaktapur",
  pokhara: "Pokhara",
  remote: "Remote",
  other: "Other",
};

const SRC_LABELS: Record<string, string> = {
  merojob: "Merojob",
  kumarijob: "KumariJob",
  sathijob: "SathiJob",
  internsathi: "InternSathi",
};

const POSTED_LABELS: Record<string, string> = {
  "24h": "Last 24h",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

interface Chip {
  key: string;
  value: string;
  label: string;
}

export function JobsActiveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const buildChips = (): Chip[] => {
    const chips: Chip[] = [];

    const q = sp.get("q");
    if (q) chips.push({ key: "q", value: "", label: `"${q}"` });

    const types = (sp.get("type") || "").split(",").filter(Boolean);
    for (const t of types) chips.push({ key: "type", value: t, label: TYPE_LABELS[t] || t });

    const locs = (sp.get("loc") || "").split(",").filter(Boolean);
    for (const l of locs) chips.push({ key: "loc", value: l, label: LOC_LABELS[l] || l });

    const posted = sp.get("posted");
    if (posted && posted !== "any") {
      chips.push({ key: "posted", value: "", label: POSTED_LABELS[posted] || posted });
    }

    const sources = (sp.get("source") || "").split(",").filter(Boolean);
    for (const s of sources) chips.push({ key: "source", value: s, label: SRC_LABELS[s] || s });

    if (sp.get("salary") === "1") chips.push({ key: "salary", value: "", label: "Salary disclosed" });
    if (sp.get("closing") === "1") chips.push({ key: "closing", value: "", label: "Closing soon" });

    return chips;
  };

  const removeChip = (chip: Chip) => {
    const next = new URLSearchParams(sp.toString());
    if (chip.value) {
      const existing = (next.get(chip.key) || "").split(",").filter((v) => v !== chip.value);
      if (existing.length > 0) next.set(chip.key, existing.join(","));
      else next.delete(chip.key);
    } else {
      next.delete(chip.key);
    }
    next.delete("page");
    next.delete("id");
    router.push(pathname + "?" + next.toString(), { scroll: false });
  };

  const clearAll = () => {
    const next = new URLSearchParams(sp.toString());
    for (const k of ["q", "type", "loc", "posted", "source", "salary", "closing", "page", "id"]) {
      next.delete(k);
    }
    const qs = next.toString();
    router.push(pathname + (qs ? "?" + qs : ""), { scroll: false });
  };

  const setSort = (sort: string) => {
    const next = new URLSearchParams(sp.toString());
    if (sort === "new") next.delete("sort");
    else next.set("sort", sort);
    next.delete("page");
    next.delete("id");
    router.push(pathname + "?" + next.toString(), { scroll: false });
  };

  const chips = buildChips();
  const sort = sp.get("sort") || "new";

  return (
    <div className="jobs-active">
      {chips.length > 0 && (
        <div className="jobs-active__summary">
          <span className="jobs-active__chips">
            {chips.map((c, i) => (
              <button
                key={i}
                type="button"
                className="jobs-active__chip"
                onClick={() => removeChip(c)}
                aria-label={`Remove filter ${c.label}`}
              >
                {c.label}
                <X size={10} />
              </button>
            ))}
          </span>
          <button type="button" className="jobs-active__clear" onClick={clearAll}>
            Clear all
          </button>
        </div>
      )}

      <div className="jobs-active__sort">
        <label htmlFor="job-sort" className="jobs-active__sort-label">Sort by</label>
        <select
          id="job-sort"
          className="select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="new">Newest</option>
          <option value="closing">Closing soon</option>
        </select>
      </div>
    </div>
  );
}
