"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import type { JobFacets } from "@/app/lib/queries";

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

const POSTED_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

interface Props {
  facets: JobFacets;
}

export function JobsFilterPanel({ facets }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [qInput, setQInput] = useState(searchParams.get("q") || "");

  const getList = (key: string): string[] => {
    const v = searchParams.get(key);
    return v ? v.split(",").filter(Boolean) : [];
  };

  const toggle = useCallback(
    (key: string, value: string) => {
      const list = getList(key);
      const idx = list.indexOf(value);
      const next = idx >= 0 ? list.filter((v) => v !== value) : [...list, value];
      const params = new URLSearchParams(searchParams.toString());
      if (next.length > 0) params.set(key, next.join(","));
      else params.delete(key);
      params.delete("page");
      router.push(pathname + "?" + params.toString(), { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setSingle = useCallback(
    (key: string, value: string, defaultValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === defaultValue) params.delete(key);
      else params.set(key, value);
      params.delete("page");
      router.push(pathname + "?" + params.toString(), { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (qInput.trim()) params.set("q", qInput.trim());
    else params.delete("q");
    params.delete("page");
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const clearAll = () => {
    setQInput("");
    router.push(pathname, { scroll: false });
  };

  const activeTypes = getList("type");
  const activeLocs = getList("loc");
  const activeSources = getList("source");
  const posted = searchParams.get("posted") || "any";
  const salary = searchParams.get("salary") === "1";
  const closing = searchParams.get("closing") === "1";
  const hasAny =
    activeTypes.length > 0 ||
    activeLocs.length > 0 ||
    activeSources.length > 0 ||
    posted !== "any" ||
    salary ||
    closing ||
    !!searchParams.get("q");

  return (
    <aside className="jobs-filter" aria-label="Filters">
      <form onSubmit={submitSearch} className="jobs-filter__search">
        <Search size={14} />
        <input
          type="search"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search title, company"
          aria-label="Search jobs"
        />
        {qInput && (
          <button
            type="button"
            onClick={() => {
              setQInput("");
              const params = new URLSearchParams(searchParams.toString());
              params.delete("q");
              params.delete("page");
              router.push(pathname + "?" + params.toString(), { scroll: false });
            }}
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </form>

      {hasAny && (
        <button type="button" className="jobs-filter__clear" onClick={clearAll}>
          Clear all
        </button>
      )}

      <FilterGroup label="Type">
        {Object.entries(TYPE_LABELS).map(([key, label]) => {
          const count = facets.types[key] || 0;
          if (count === 0) return null;
          return (
            <FilterCheck
              key={key}
              label={label}
              count={count}
              checked={activeTypes.includes(key)}
              onChange={() => toggle("type", key)}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup label="Location">
        {Object.entries(LOC_LABELS).map(([key, label]) => {
          const count = facets.locations[key] || 0;
          if (count === 0) return null;
          return (
            <FilterCheck
              key={key}
              label={label}
              count={count}
              checked={activeLocs.includes(key)}
              onChange={() => toggle("loc", key)}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup label="Posted within">
        {POSTED_OPTIONS.map((opt) => (
          <label key={opt.value} className="jobs-filter__radio">
            <input
              type="radio"
              name="posted"
              checked={posted === opt.value}
              onChange={() => setSingle("posted", opt.value, "any")}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </FilterGroup>

      {Object.keys(facets.sources).length > 0 && (
        <FilterGroup label="Source">
          {Object.entries(SRC_LABELS).map(([key, label]) => {
            const count = facets.sources[key] || 0;
            if (count === 0) return null;
            return (
              <FilterCheck
                key={key}
                label={label}
                count={count}
                checked={activeSources.includes(key)}
                onChange={() => toggle("source", key)}
              />
            );
          })}
        </FilterGroup>
      )}

      <FilterGroup label="Refine">
        <FilterCheck
          label="Salary disclosed"
          checked={salary}
          onChange={() => setSingle("salary", salary ? "" : "1", "")}
        />
        <FilterCheck
          label="Closing within 7 days"
          checked={closing}
          onChange={() => setSingle("closing", closing ? "" : "1", "")}
        />
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="jobs-filter__group">
      <button
        type="button"
        className="jobs-filter__group-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="jobs-filter__group-body">{children}</div>}
    </div>
  );
}

function FilterCheck({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="jobs-filter__check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="jobs-filter__check-label">{label}</span>
      {count !== undefined && <span className="jobs-filter__check-count">{count}</span>}
    </label>
  );
}
