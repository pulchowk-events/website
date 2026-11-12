import Link from "next/link";
import { ScholarshipImage } from "./ScholarshipImage";
import { DeadlinePill } from "./DeadlinePill";
import type { Scholarship } from "@/app/lib/queries";

function sourceLabel(source: string | null): string | null {
  if (!source) return null;
  if (source === "erasmusmundus") return "Erasmus Mundus";
  if (source === "scholarshipsads") return "ScholarshipsAds";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function ScholarshipRow({ scholarship }: { scholarship: Scholarship }) {
  const provider = scholarship.provider || sourceLabel(scholarship.source);
  const initial = (provider || scholarship.title).charAt(0).toUpperCase();

  return (
    <Link href={"/scholarships/" + scholarship.id} className="row sch-row">
      <span className="sch-row__logo">
        <ScholarshipImage src={scholarship.image_url} alt="" initial={initial} />
      </span>
      <div className="sch-row__body">
        <p className="row-title sch-row__title">{scholarship.title}</p>
        <div className="row-meta">
          {provider && <span>{provider}</span>}
          {scholarship.degree_level && (
            <>
              <span className="row-dot">{"\u00b7"}</span>
              <span>{scholarship.degree_level}</span>
            </>
          )}
          {scholarship.field_of_study && (
            <>
              <span className="row-dot">{"\u00b7"}</span>
              <span>{scholarship.field_of_study}</span>
            </>
          )}
        </div>
      </div>
      <div className="sch-row__deadline">
        <DeadlinePill
          status={scholarship.deadline_status}
          display={scholarship.deadline_display}
          parsed={scholarship.deadline_parsed}
        />
      </div>
    </Link>
  );
}
