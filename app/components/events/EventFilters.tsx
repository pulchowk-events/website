"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { readEventFilters, type EventFilterState } from "@/app/lib/eventFilters";
import { useCallback } from "react";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "gaming", label: "Gaming" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "extra", label: "Extra" },
];

const WHEN: { value: string; label: string }[] = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "weekend", label: "This weekend" },
  { value: "month", label: "This month" },
];

const CITIES = [
  { value: "all", label: "Any city" },
  { value: "kathmandu", label: "Kathmandu" },
  { value: "lalitpur", label: "Lalitpur" },
  { value: "bhaktapur", label: "Bhaktapur" },
  { value: "pokhara", label: "Pokhara" },
  { value: "remote", label: "Remote" },
];

const PRICES = [
  { value: "all", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export function EventFilters({ state }: { state: EventFilterState }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = useCallback(
    (key: string, value: string, defaultValue: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === defaultValue) next.delete(key);
      else next.set(key, value);
      next.delete("page");
      router.push(pathname + "?" + next.toString(), { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const hasFilters =
    state.category !== "all" ||
    state.when !== "all" ||
    state.city !== "all" ||
    state.price !== "all";

  const clearAll = () => {
    const next = new URLSearchParams();
    if (state.tab === "past") next.set("tab", "past");
    if (state.view === "list") next.set("view", "list");
    const qs = next.toString();
    router.push(pathname + (qs ? "?" + qs : ""), { scroll: false });
  };

  return (
    <div className="event-filters">
      <div className="event-filters__row">
        <div className="seg">
          <button
            type="button"
            className={"seg__item" + (state.tab === "upcoming" ? " seg__item--on" : "")}
            onClick={() => set("tab", "upcoming", "upcoming")}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={"seg__item" + (state.tab === "past" ? " seg__item--on" : "")}
            onClick={() => set("tab", "past", "upcoming")}
          >
            Past
          </button>
        </div>

        <div className="event-filters__spacer" />

        <div className="seg">
          <button
            type="button"
            className={"seg__item" + (state.view === "grid" ? " seg__item--on" : "")}
            onClick={() => set("view", "grid", "grid")}
          >
            Grid
          </button>
          <button
            type="button"
            className={"seg__item" + (state.view === "list" ? " seg__item--on" : "")}
            onClick={() => set("view", "list", "grid")}
          >
            List
          </button>
        </div>
      </div>

      <div className="event-filters__row event-filters__row--scroll">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            className={"chip" + (state.category === c.value ? " chip--on" : "")}
            onClick={() => set("cat", c.value, "all")}
          >
            {c.label}
          </button>
        ))}
        <span className="event-filters__divider" aria-hidden="true" />
        {WHEN.map((w) => (
          <button
            key={w.value}
            type="button"
            className={"chip" + (state.when === w.value ? " chip--on" : "")}
            onClick={() => set("when", w.value, "all")}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className="event-filters__row">
        <select
          className="select"
          value={state.city}
          onChange={(e) => set("city", e.target.value, "all")}
          aria-label="City"
        >
          {CITIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          className="select"
          value={state.price}
          onChange={(e) => set("price", e.target.value, "all")}
          aria-label="Price"
        >
          {PRICES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        {hasFilters && (
          <button type="button" className="event-filters__clear" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
