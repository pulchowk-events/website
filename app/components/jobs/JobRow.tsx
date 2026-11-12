"use client";

import Image from "next/image";
import { useState } from "react";
import { SaveButton } from "@/app/components/shell/SaveButton";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  attendance_mode: string | null;
  salary: string | null;
  salary_disclosed: boolean | null;
  application_ends_at: string | null;
  posted_at: string | null;
  origin: string;
  image_url: string | null;
}

interface Props {
  job: Job;
  saved: boolean;
  selected: boolean;
  onClick: () => void;
}

function deadlineLabel(iso: string | null): { text: string; tone: "mute" | "warn" | "urgent" } | null {
  if (!iso) return null;
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5);
  if (days < 0) return null;
  if (days === 0) return { text: "Closes today", tone: "urgent" };
  if (days <= 3) return { text: days + " days left", tone: "urgent" };
  if (days <= 7) return { text: days + " days left", tone: "warn" };
  return { text: days + " days left", tone: "mute" };
}

function typeLabel(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes("intern")) return "Internship";
  if (s.includes("full")) return "Full-time";
  if (s.includes("part")) return "Part-time";
  if (s.includes("contract")) return "Contract";
  if (s.includes("freelance")) return "Freelance";
  return raw;
}

function sourceLabel(origin: string): string | null {
  if (!origin?.startsWith("scraper:")) return null;
  const key = origin.slice(8);
  const map: Record<string, string> = {
    merojob: "Merojob",
    kumarijob: "KumariJob",
    sathijob: "SathiJob",
    internsathi: "InternSathi",
  };
  for (const [k, v] of Object.entries(map)) if (key.includes(k)) return v;
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function JobRow({ job, saved, selected, onClick }: Props) {
  const dl = deadlineLabel(job.application_ends_at);
  const type = typeLabel(job.employment_type);
  const source = sourceLabel(job.origin);
  const salaryShown = job.salary && job.salary.trim() ? job.salary : null;
  const [imgBroken, setImgBroken] = useState(false);
  const showLogo = !!job.image_url && !imgBroken;

  return (
    <div className={"job-row-new" + (selected ? " job-row-new--selected" : "")} onClick={onClick}>
      <span className="job-row-new__logo">
        {showLogo ? (
          <Image
            src={job.image_url!}
            alt=""
            width={40}
            height={40}
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setImgBroken(true)}
          />
        ) : (
          <span className="job-row-new__logo-initial">{job.company.charAt(0).toUpperCase()}</span>
        )}
      </span>

      <div className="job-row-new__body">
        <p className="row-title">{job.title}</p>
        <div className="row-meta">
          <span>{job.company}</span>
          {job.location && <><span className="row-dot">·</span><span>{job.location}</span></>}
          {type && <><span className="row-dot">·</span><span className="job-row-new__badge">{type}</span></>}
          {job.attendance_mode && <><span className="row-dot">·</span><span>{job.attendance_mode}</span></>}
          {source && <><span className="row-dot">·</span><span className="job-row-new__source">{source}</span></>}
        </div>
      </div>

      <div className="job-row-new__meta">
        {salaryShown && <span className="job-row-new__salary">{salaryShown}</span>}
        {!salaryShown && <span className="job-row-new__salary job-row-new__salary--none">Not disclosed</span>}
        {dl && <span className={"job-row-new__deadline job-row-new__deadline--" + dl.tone}>{dl.text}</span>}
      </div>

      <div className="job-row-new__actions" onClick={(e) => e.stopPropagation()}>
        <SaveButton itemType="job" itemId={job.id} initialSaved={saved} />
      </div>
    </div>
  );
}
