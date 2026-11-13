"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const DEGREE_OPTIONS = [
  { value: "any", label: "All levels" },
  { value: "Bachelor", label: "Bachelor" },
  { value: "Masters", label: "Masters" },
  { value: "PhD", label: "PhD" },
  { value: "Fellowship", label: "Fellowship" },
  { value: "Undergraduate", label: "Undergraduate" },
  { value: "Post Doctorate", label: "Post Doc" },
];

const STATUS_OPTIONS = [
  { value: "any", label: "Any deadline" },
  { value: "parsed", label: "Has a date" },
  { value: "estimated-year-only", label: "Year only" },
  { value: "rolling", label: "Rolling" },
  { value: "unknown", label: "None listed" },
];

const COUNTRY_OPTIONS = [
  { value: "any", label: "All countries" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Italy", label: "Italy" },
  { value: "Spain", label: "Spain" },
  { value: "UK", label: "UK" },
  { value: "USA", label: "USA" },
  { value: "Portugal", label: "Portugal" },
  { value: "Belgium", label: "Belgium" },
  { value: "China", label: "China" },
  { value: "Finland", label: "Finland" },
  { value: "Sweden", label: "Sweden" },
  { value: "South Korea", label: "South Korea" },
  { value: "Australia", label: "Australia" },
  { value: "Japan", label: "Japan" },
  { value: "Netherlands", label: "Netherlands" },
];

const SORT_OPTIONS = [
  { value: "new", label: "Newest" },
  { value: "closing", label: "Closing soon" },
];

export function ScholarshipFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [qInput, setQInput] = useState(sp.get("q") || "");

  const degree = sp.get("degree") || "any";
  const country = sp.get("country") || "any";
  const status = sp.get("status") || "any";
  const sort = sp.get("sort") || "new";

  const hasFilters =
    degree !== "any" ||
    country !== "any" ||
    status !== "any" ||
    sort !== "new" ||
    !!sp.get("q");

  const setSingle = (key: string, value: string, defaultValue: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value === defaultValue) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    if (qInput.trim()) params.set("q", qInput.trim());
    else params.delete("q");
    params.delete("page");
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const clearSearch = () => {
    setQInput("");
    const params = new URLSearchParams(sp.toString());
    params.delete("q");
    params.delete("page");
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const clearAll = () => {
    setQInput("");
    const params = new URLSearchParams();
    const sortKeep = sp.get("sort");
    if (sortKeep === "closing") params.set("sort", "closing");
    router.push(pathname + (params.toString() ? "?" + params.toString() : ""), { scroll: false });
  };

  return (
    <div className="sch-filters">
      <form onSubmit={submitSearch} className="sch-filters__search">
        <Search size={14} />
        <input
          type="search"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search scholarships"
          aria-label="Search scholarships"
        />
        {qInput && (
          <button type="button" onClick={clearSearch} aria-label="Clear search">
            <X size={12} />
          </button>
        )}
      </form>

      <div className="sch-filters__row sch-filters__row--scroll">
        {DEGREE_OPTIONS.map((c) => (
          <button
            key={c.value}
            type="button"
            className={"chip" + (degree === c.value ? " chip--on" : "")}
            onClick={() => setSingle("degree", c.value, "any")}
          >
            {c.label}
          </button>
        ))}
        <span className="sch-filters__divider" aria-hidden="true" />
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            className={"chip" + (status === s.value ? " chip--on" : "")}
            onClick={() => setSingle("status", s.value, "any")}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="sch-filters__row">
        <select
          aria-label="Country"
          className="select"
          value={country}
          onChange={(e) => setSingle("country", e.target.value, "any")}
        >
          {COUNTRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          aria-label="Sort by"
          className="select"
          value={sort}
          onChange={(e) => setSingle("sort", e.target.value, "new")}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button type="button" className="sch-filters__clear" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
