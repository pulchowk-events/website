"use client";

import { useState } from "react";
import type { WeekdayPattern as Pattern } from "@/app/lib/queries";

interface Props {
  data: Pattern;
}

export function WeekdayPattern({ data }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const hasEvents = data.totalEvents > 0;
  const hasJobs = data.totalJobs > 0;
  if (!hasEvents && !hasJobs) return null;

  const max = Math.max(
    ...data.buckets.map((b) => b.events + b.jobs),
    1,
  );

  return (
    <section className="home-section weekday">
      <header className="home-section__head">
        <h2 className="home-section__title">Activity by day</h2>
      </header>

      <div className="weekday__legend">
        {hasEvents && (
          <span className="weekday__legend-item">
            <span className="weekday__dot weekday__dot--events" />
            Events
          </span>
        )}
        {hasJobs && (
          <span className="weekday__legend-item">
            <span className="weekday__dot weekday__dot--jobs" />
            Jobs
          </span>
        )}
      </div>

      <div className="weekday__chart">
        {data.buckets.map((b, i) => {
          const isToday = b.dow === data.today;
          const isHover = hover === i;
          const total = b.events + b.jobs;
          const totalPct = (total / max) * 100;
          const eventsPct = total > 0 ? (b.events / total) * 100 : 0;
          const jobsPct = total > 0 ? (b.jobs / total) * 100 : 0;

          return (
            <div
              key={b.dow}
              className={
                "weekday__col" +
                (isToday ? " weekday__col--today" : "") +
                (isHover ? " weekday__col--hover" : "")
              }
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="weekday__bar-wrap">
                <span
                  className="weekday__bar"
                  style={{ height: `${Math.max(totalPct, 1)}%` }}
                >
                  {hasJobs && b.jobs > 0 && (
                    <span
                      className="weekday__seg weekday__seg--jobs"
                      style={{ height: `${jobsPct}%` }}
                    />
                  )}
                  {hasEvents && b.events > 0 && (
                    <span
                      className="weekday__seg weekday__seg--events"
                      style={{ height: `${eventsPct}%` }}
                    />
                  )}
                </span>
              </div>
              <span className="weekday__label">{b.label.slice(0, 1)}</span>
              {isHover && (
                <span className="weekday__tooltip">
                  {b.label} · {b.events} events · {b.jobs} jobs
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
