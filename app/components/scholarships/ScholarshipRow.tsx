"use client";

import Link from "next/link";
import { ScholarshipImage } from "./ScholarshipImage";
import { DeadlinePill } from "./DeadlinePill";
import { SaveButton } from "@/app/components/shell/SaveButton";
import type { Scholarship } from "@/app/lib/queries";

function sourceLabel(source: string | null): string | null {
  if (!source) return null;
  if (source === "erasmusmundus") return "Erasmus Mundus";
  if (source === "scholarshipsads") return "ScholarshipsAds";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

interface Props {
  scholarship: Scholarship;
  saved?: boolean;
  showSave?: boolean;
}

export function ScholarshipRow({ scholarship, saved = false, showSave = true }: Props) {
  const provider = scholarship.provider || sourceLabel(scholarship.source);
  const initial = (provider || scholarship.title).charAt(0).toUpperCase();

  return (
    <div className="row sch-row">
      <Link href={"/scholarships/" + scholarship.id} className="sch-row__main">
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
      {showSave && (
        <div className="sch-row__actions">
          <SaveButton itemType="scholarship" itemId={scholarship.id} initialSaved={saved} compact />
        </div>
      )}
    </div>
  );
}
