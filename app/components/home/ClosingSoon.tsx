import Link from "next/link";
import { Clock } from "lucide-react";
import type { ClosingSoonRow } from "@/app/lib/queries";
import { daysUntilNPT } from "@/app/lib/formatDate";

interface Props {
  rows: ClosingSoonRow[];
}

function toneFor(days: number): "urgent" | "warn" | "mute" {
  if (days <= 7) return "urgent";
  if (days <= 21) return "warn";
  return "mute";
}

export function ClosingSoon({ rows }: Props) {
  if (rows.length === 0) return null;

  return (
    <section className="home-section closing-soon">
      <header className="home-section__head">
        <h2 className="home-section__title">Closing soon</h2>
        <Link href="/scholarships?sort=closing" className="home-section__see">See all</Link>
      </header>

      <ul className="closing-soon__list">
        {rows.map((r) => {
          const days = daysUntilNPT(r.deadline_parsed);
          const tone = toneFor(days);
          return (
            <li key={r.id} className="closing-soon__row">
              <Link href={`/scholarships/${r.id}`} className="closing-soon__link">
                <span className="closing-soon__body">
                  <span className="closing-soon__title">{r.title}</span>
                  {r.degree_level && (
                    <span className="closing-soon__degree">{r.degree_level}</span>
                  )}
                </span>
                <span className={`closing-soon__pill closing-soon__pill--${tone}`}>
                  <Clock size={10} />
                  {days === 0 ? "Today" : days === 1 ? "1d" : `${days}d`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
