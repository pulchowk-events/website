"use client";

import { useRef, useState } from "react";
import type { DailyActivity } from "@/app/lib/queries";

const SERIES = [
  { key: "events" as const, label: "Events", color: "#51aeff" },
  { key: "jobs" as const, label: "Jobs", color: "#f5a623" },
  { key: "scholarships" as const, label: "Scholarships", color: "#3ecf8e" },
];

const W = 800;
const H = 160;
const PAD = 6;

interface Props {
  data: DailyActivity[];
}

export function ActivityChart({ data }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const totals = data.reduce(
    (a, d) => ({
      events: a.events + d.events,
      jobs: a.jobs + d.jobs,
      scholarships: a.scholarships + d.scholarships,
    }),
    { events: 0, jobs: 0, scholarships: 0 },
  );
  const grand = totals.events + totals.jobs + totals.scholarships;
  if (grand === 0) return null;

  const max = Math.max(
    ...data.flatMap((d) => [d.events, d.jobs, d.scholarships]),
    1,
  );

  const x = (i: number) =>
    data.length <= 1 ? W / 2 : PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);

  const pathFor = (key: "events" | "jobs" | "scholarships") =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`)
      .join(" ");

  const areaFor = (key: "events" | "jobs" | "scholarships") =>
    `${pathFor(key)} L ${x(data.length - 1).toFixed(1)} ${H - PAD} L ${x(0).toFixed(1)} ${H - PAD} Z`;

  const handleMove = (e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = (e.clientX - rect.left) / rect.width;
    const i = Math.round(rel * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  const hoverDay = hover !== null ? data[hover] : null;

  return (
    <section className="home-section activity">
      <header className="home-section__head">
        <h2 className="home-section__title">Site activity</h2>
        <span className="activity__sub">Last {data.length} days</span>
      </header>

      <div className="activity__legend">
        {SERIES.map((s) => (
          <span key={s.key} className="activity__legend-item">
            <span className="activity__dot" style={{ background: s.color }} />
            {s.label}
            <span className="activity__legend-count">{totals[s.key]}</span>
          </span>
        ))}
      </div>

      <div
        className="activity__chart"
        ref={wrapRef}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <div className="activity__y-axis" aria-hidden="true">
          {[1, 0.75, 0.5, 0.25].map((p) => (
            <span
              key={p}
              className="activity__y-label"
              style={{ top: `${(y(max * p) / H) * 100}%` }}
            >
              {Math.round(max * p)}
            </span>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="activity__svg"
          aria-hidden="true"
        >
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1={PAD}
              x2={W - PAD}
              y1={y(max * p)}
              y2={y(max * p)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {SERIES.map((s) => (
            <path
              key={"area-" + s.key}
              d={areaFor(s.key)}
              fill={s.color}
              fillOpacity={0.07}
              stroke="none"
            />
          ))}
          {SERIES.map((s) => (
            <path
              key={"line-" + s.key}
              d={pathFor(s.key)}
              fill="none"
              stroke={s.color}
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              className={"activity__line activity__line--" + s.key}
            />
          ))}
        </svg>

        {hover !== null && (
          <>
            <div
              className="activity__crosshair"
              style={{ left: `${(hover / Math.max(1, data.length - 1)) * 100}%` }}
            />
            {SERIES.map((s) => (
              <div
                key={"dot-" + s.key}
                className="activity__hover-dot"
                style={{
                  left: `${(hover / Math.max(1, data.length - 1)) * 100}%`,
                  top: `${(y(hoverDay![s.key]) / H) * 100}%`,
                  background: s.color,
                }}
              />
            ))}
          </>
        )}

        {hoverDay && (
          <div
            className="activity__tooltip"
            style={{ left: `${(hover! / Math.max(1, data.length - 1)) * 100}%` }}
          >
            <p className="activity__tt-head">
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              }).format(new Date(hoverDay.date + "T00:00:00Z"))}
            </p>
            {SERIES.map((s) => (
              <p key={s.key} className="activity__tt-row">
                <span className="activity__dot" style={{ background: s.color }} />
                <span>{s.label}</span>
                <span className="activity__tt-val">{hoverDay[s.key]}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="activity__axis">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[Math.floor(data.length / 2)]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </section>
  );
}
