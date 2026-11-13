"use client";

import { useEffect } from "react";
import { SmartImg } from "@/app/components/ui/SmartImg";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";
import Markdown from "@/app/components/ui/Markdown";
import { SaveButton } from "@/app/components/shell/SaveButton";
import { ShareMenu } from "@/app/components/shell/ShareMenu";
import { formatDateShort } from "@/app/lib/formatDate";
import { formatSalary } from "@/app/lib/formatSalary";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string | null;
  location: string | null;
  salary: string | null;
  salary_disclosed: boolean | null;
  experience: string | null;
  level: string | null;
  openings: number | null;
  employment_type: string | null;
  attendance_mode: string | null;
  skills: string[] | null;
  url: string;
  image_url: string | null;
  application_ends_at: string | null;
  posted_at: string | null;
  origin: string;
}

interface Props {
  job: Job;
  saved: boolean;
  onClose: () => void;
}

export function JobDetailSheet({ job, saved, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/jobs/" + job.id
      : "https://pulchowkevents.netlify.app/jobs/" + job.id;

  const facts: { label: string; value: string | null }[] = [
    { label: "Location", value: job.location },
    { label: "Type", value: job.employment_type },
    { label: "Salary", value: formatSalary(job.salary) },
    { label: "Experience", value: job.experience },
    { label: "Level", value: job.level },
    { label: "Openings", value: job.openings ? String(job.openings) : null },
    { label: "Work mode", value: job.attendance_mode },
    { label: "Apply by", value: job.application_ends_at ? formatDateShort(job.application_ends_at) : null },
  ].filter((f) => f.value);

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="sheet" role="dialog" aria-label={job.title}>
        <header className="sheet__head">
          <span className="sheet__close-wrap">
            <button type="button" onClick={onClose} className="row-icon-btn" aria-label="Close">
              <X size={16} />
            </button>
          </span>
          <div className="sheet__head-actions">
            <SaveButton itemType="job" itemId={job.id} initialSaved={saved} />
            <ShareMenu url={shareUrl} title={job.title + " at " + job.company} />
          </div>
        </header>

        <div className="sheet__body">
          <div className="sheet__company">
            <span className="sheet__logo">
              <SmartImg
                src={job.image_url}
                alt=""
                seed={job.id}
                fallback={<span className="sheet__logo-initial">{job.company.charAt(0)}</span>}
              />
            </span>
            <div className="sheet__company-meta">
              <h2 className="sheet__title">{job.title}</h2>
              <p className="sheet__company-name">{job.company}</p>
            </div>
          </div>

          <dl className="sheet__facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          {job.skills && job.skills.length > 0 && (
            <div className="sheet__skills">
              <p className="sheet__section-label">Skills</p>
              <div className="sheet__skills-list">
                {job.skills.map((s, i) => (
                  <span key={i} className="cat-chip">{s}</span>
                ))}
              </div>
            </div>
          )}

          {job.description && (
            <div className="sheet__desc">
              <p className="sheet__section-label">Description</p>
              <Markdown content={job.description} />
            </div>
          )}
        </div>

        <footer className="sheet__foot">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
            style={{ flex: 1 }}
          >
            <ExternalLink size={14} style={{ marginRight: 8 }} />
            Apply on original site
          </a>
          <Link href={"/jobs/" + job.id} className="btn btn--secondary">
            Open page
          </Link>
        </footer>
      </aside>
    </>
  );
}
