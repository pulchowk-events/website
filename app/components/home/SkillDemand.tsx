import Link from "next/link";
import type { TechSkillRow } from "@/app/lib/queries";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\+\+/g, "pp")
    .replace(/#/g, "sharp")
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface Props {
  rows: TechSkillRow[];
}

export function SkillDemand({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <section className="home-section skills">
        <header className="home-section__head">
          <h2 className="home-section__title">Tech skills</h2>
          <span className="skills__sub">60 days</span>
        </header>
        <p className="row-empty">Not enough tech job data yet.</p>
      </section>
    );
  }

  const max = Math.max(...rows.map((r) => r.companies), 1);

  return (
    <section className="home-section skills">
      <header className="home-section__head">
        <h2 className="home-section__title">Tech skills</h2>
        <span className="skills__sub">60 days</span>
      </header>

      <ul className="skills__list">
        {rows.map((r) => {
          const pct = (r.companies / max) * 100;
          return (
            <li key={r.skill} className="skills__row">
              <Link
                href={`/jobs/skills/${slugify(r.skill)}`}
                className="skills__link"
              >
                <span className="skills__bar" aria-hidden="true">
                  <span className="skills__fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="skills__name">{r.skill}</span>
                <span
                  className="skills__count"
                  title={`${r.companies} ${r.companies === 1 ? "company" : "companies"}, ${r.jobs} ${r.jobs === 1 ? "job" : "jobs"}`}
                >
                  {r.companies}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
