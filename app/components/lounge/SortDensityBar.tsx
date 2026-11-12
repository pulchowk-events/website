"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "discussions", label: "Discussions" },
  { value: "announcements", label: "Announcements" },
  { value: "opportunities", label: "Opportunities" },
  { value: "tech-help", label: "Tech help" },
  { value: "showcases", label: "Showcases" },
  { value: "confessions", label: "Confessions" },
];

export function SortDensityBar({
  sort,
  density,
  category,
}: {
  sort: "latest" | "top";
  density: "comfortable" | "compact";
  category: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (key: string, value: string, defaultValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    const qs = params.toString();
    router.push(pathname + (qs ? "?" + qs : ""), { scroll: false });
  };

  return (
    <div className="lounge-bar">
      <div className="lounge-bar__row">
        <div className="seg">
          <button
            type="button"
            className={"seg__item" + (sort === "latest" ? " seg__item--on" : "")}
            onClick={() => update("sort", "latest", "latest")}
          >
            Latest
          </button>
          <button
            type="button"
            className={"seg__item" + (sort === "top" ? " seg__item--on" : "")}
            onClick={() => update("sort", "top", "latest")}
          >
            Top
          </button>
        </div>

        <div style={{ flex: 1 }} />

        <div className="seg">
          <button
            type="button"
            className={"seg__item" + (density === "comfortable" ? " seg__item--on" : "")}
            onClick={() => update("density", "comfortable", "comfortable")}
          >
            Comfortable
          </button>
          <button
            type="button"
            className={"seg__item" + (density === "compact" ? " seg__item--on" : "")}
            onClick={() => update("density", "compact", "comfortable")}
          >
            Compact
          </button>
        </div>
      </div>

      <div className="lounge-bar__cats">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            className={"chip" + (category === c.value ? " chip--on" : "")}
            onClick={() => update("cat", c.value, "all")}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
