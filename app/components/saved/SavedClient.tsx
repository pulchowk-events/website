"use client";

import { useMemo, useState } from "react";
import type { SavedItem as SavedItemType } from "@/app/lib/queries";
import { SavedItem } from "./SavedItem";
import { PostRow } from "@/app/components/shell/rows/PostRow";
import { EventRow } from "@/app/components/shell/rows/EventRow";
import { JobRow } from "@/app/components/shell/rows/JobRow";
import { ProjectRow } from "@/app/components/shell/rows/ProjectRow";

type Tab = "all" | "posts" | "events" | "jobs" | "projects";

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "posts", label: "Posts" },
  { value: "events", label: "Events" },
  { value: "jobs", label: "Jobs" },
  { value: "projects", label: "Projects" },
];

interface Props {
  items: SavedItemType[];
}

function renderRow(item: SavedItemType) {
  if (item.type === "post") {
    return <PostRow post={item.data} showThumb showExcerpt />;
  }
  if (item.type === "event") {
    return <EventRow event={item.data} />;
  }
  if (item.type === "job") {
    return <JobRow job={item.data} />;
  }
  return <ProjectRow project={item.data} />;
}

function matchesTab(item: SavedItemType, tab: Tab): boolean {
  if (tab === "all") return true;
  if (tab === "posts") return item.type === "post";
  if (tab === "events") return item.type === "event";
  if (tab === "jobs") return item.type === "job";
  if (tab === "projects") return item.type === "project";
  return false;
}

export function SavedClient({ items }: Props) {
  const [tab, setTab] = useState<Tab>("all");

  const counts = useMemo(
    () => ({
      all: items.length,
      posts: items.filter((i) => i.type === "post").length,
      events: items.filter((i) => i.type === "event").length,
      jobs: items.filter((i) => i.type === "job").length,
      projects: items.filter((i) => i.type === "project").length,
    }),
    [items],
  );

  const visible = items.filter((i) => matchesTab(i, tab));

  const now = Date.now();
  const upcoming = visible
    .filter((i) => i.type === "event" && new Date(i.data.event_date).getTime() >= now)
    .sort((a, b) => new Date(a.data.event_date).getTime() - new Date(b.data.event_date).getTime());

  const rest = visible.filter((i) => !upcoming.includes(i));

  const empty = visible.length === 0;

  return (
    <>
      <div className="saved-tabs">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            className={"tab" + (tab === t.value ? " tab--on" : "")}
            onClick={() => setTab(t.value)}
          >
            {t.label}
            <span className="saved-tabs__count">{counts[t.value]}</span>
          </button>
        ))}
      </div>

      {empty ? (
        <div className="empty-row" style={{ marginTop: 16 }}>
          <p>
            {tab === "all"
              ? "Nothing saved yet."
              : "Nothing saved in this category."}
          </p>
          <p className="saved-empty-hint">
            Tap the bookmark on any event, job, post, or project.
          </p>
        </div>
      ) : (
        <div className="saved-body">
          {upcoming.length > 0 && (
            <section className="saved-group">
              <header className="saved-group__head">Coming up</header>
              <div className="saved-group__body">
                {upcoming.map((item) => (
                  <SavedItem key={item.type + ":" + item.data.id} itemType={item.type} itemId={String(item.data.id)}>
                    {renderRow(item)}
                  </SavedItem>
                ))}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section className="saved-group">
              {upcoming.length > 0 && (
                <header className="saved-group__head">
                  {tab === "all" ? "Everything else" : tab === "events" ? "Past events" : ""}
                </header>
              )}
              <div className="saved-group__body">
                {rest.map((item) => (
                  <SavedItem key={item.type + ":" + item.data.id} itemType={item.type} itemId={String(item.data.id)}>
                    {renderRow(item)}
                  </SavedItem>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
