import Link from "next/link";
import { ArrowLeft, Building2, Calendar, ExternalLink, GraduationCap, Tag } from "lucide-react";
import { ScholarshipImage } from "./ScholarshipImage";
import { DeadlinePill } from "./DeadlinePill";
import { formatDateShort } from "@/app/lib/formatDate";
import type { Scholarship } from "@/app/lib/queries";

function sourceLabel(source: string | null): string | null {
  if (!source) return null;
  if (source === "erasmusmundus") return "Erasmus Mundus";
  if (source === "scholarshipsads") return "ScholarshipsAds";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function ScholarshipDetail({ scholarship }: { scholarship: Scholarship }) {
  const provider = scholarship.provider || sourceLabel(scholarship.source);
  const initial = (provider || scholarship.title).charAt(0).toUpperCase();
  const tags = scholarship.tags || [];

  return (
    <article className="sch-detail">
      <Link href="/scholarships" className="sch-detail__back">
        <ArrowLeft size={14} /> Scholarships
      </Link>

      <header className="sch-detail__head">
        <div className="sch-detail__logo">
          <ScholarshipImage src={scholarship.image_url} alt={scholarship.title} initial={initial} />
        </div>
        <div className="sch-detail__head-body">
          <h1 className="sch-detail__title">{scholarship.title}</h1>
          <div className="sch-detail__meta">
            {provider && (
              <span className="sch-detail__meta-item"><Building2 size={14} /> {provider}</span>
            )}
            {scholarship.degree_level && (
              <span className="sch-detail__meta-item"><GraduationCap size={14} /> {scholarship.degree_level}</span>
            )}
            {scholarship.field_of_study && (
              <span className="sch-detail__meta-item"><Tag size={14} /> {scholarship.field_of_study}</span>
            )}
          </div>
          <DeadlinePill
            status={scholarship.deadline_status}
            display={scholarship.deadline_display}
            parsed={scholarship.deadline_parsed}
          />
        </div>
      </header>

      <div className="sch-detail__actions">
        {scholarship.apply_url && (
          <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
            <ExternalLink size={14} /> Apply
          </a>
        )}
        {scholarship.source_url && (
          <a href={scholarship.source_url} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
            View source
          </a>
        )}
      </div>

      {(scholarship.funding_type || scholarship.funding_amount) && (
        <dl className="sch-detail__facts">
          {scholarship.funding_type && (
            <div>
              <dt>Funding</dt>
              <dd>{scholarship.funding_type}{scholarship.funding_amount ? " \u00b7 " + scholarship.funding_amount : ""}</dd>
            </div>
          )}
          {scholarship.first_seen_at && (
            <div>
              <dt>First seen</dt>
              <dd><Calendar size={12} /> {formatDateShort(scholarship.first_seen_at)}</dd>
            </div>
          )}
        </dl>
      )}

      {scholarship.description && (
        <section>
          <h2 className="sch-detail__section-title">About</h2>
          <div className="sch-detail__desc">
            <p>{scholarship.description}</p>
          </div>
        </section>
      )}

      {tags.length > 0 && (
        <section>
          <h2 className="sch-detail__section-title">Tags</h2>
          <div className="sch-detail__tag-list">
            {tags.map((t) => <span key={t} className="chip">{t}</span>)}
          </div>
        </section>
      )}

      <footer className="sch-detail__foot">
        <p className="row-meta">
          {scholarship.source && <>Source: {sourceLabel(scholarship.source)}</>}
        </p>
      </footer>
    </article>
  );
}
