"use client";

import { useState } from "react";
import { SmartImg } from "@/app/components/ui/SmartImg";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, Users, TrendingUp, Clock,
  ExternalLink, Bookmark, Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import SignInModal from "@/app/components/signIn/SignInModal";
import { formatDateShort } from "@/app/lib/formatDate";
import { formatSalary } from "@/app/lib/formatSalary";
import Markdown from "@/app/components/ui/Markdown";
import StructuredDescription from "@/app/components/ui/StructuredDescription";

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
  application_ends_raw: string | null;
  posted_at: string | null;
  origin: string;
}

interface Props {
  job: Job;
  isSaved: boolean;
  similarJobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string | null;
    employment_type: string | null;
    posted_at: string | null;
    image_url: string | null;
  }>;
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

export default function JobDetail({ job, isSaved, similarJobs }: Props) {
  const { data: session } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const isExpired = job.application_ends_at && new Date(job.application_ends_at) < new Date();
  const source = sourceLabel(job.origin);

  const facts: { icon: any; label: string; value: string | null }[] = [
    { icon: MapPin, label: "Location", value: job.location },
    { icon: Briefcase, label: "Type", value: job.employment_type },
    { icon: DollarSign, label: "Salary", value: formatSalary(job.salary) },
    { icon: TrendingUp, label: "Experience", value: job.experience },
    { icon: TrendingUp, label: "Level", value: job.level },
    { icon: Users, label: "Openings", value: job.openings ? String(job.openings) : null },
    { icon: Clock, label: "Work mode", value: job.attendance_mode },
    {
      icon: Calendar,
      label: "Apply by",
      value: job.application_ends_raw
        ? job.application_ends_raw
        : job.application_ends_at
          ? formatDateShort(job.application_ends_at)
          : null,
    },
  ].filter((f) => f.value);

  const shareUrl = typeof window !== "undefined"
    ? window.location.origin + "/jobs/" + job.id
    : "https://pulchowkevents.netlify.app/jobs/" + job.id;

  const toggleSave = async () => {
    if (!session?.user?.id) {
      setSignInOpen(true);
      return;
    }
    setSaving(true);
    const next = !saved;
    setSaved(next);
    try {
      const res = await fetch("/api/saves", {
        method: next ? "PUT" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_type: "job", item_id: job.id }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Saved" : "Removed from Saved");
    } catch {
      setSaved(!next);
      toast.error("Could not save");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
      setShareOpen(false);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <article className="job-detail">
      <Link href="/jobs" className="ev-detail__back">
        <ArrowLeft size={14} />
        Jobs
      </Link>

      {isExpired && (
        <div className="job-detail__expired">
          This job&apos;s application deadline has passed.
        </div>
      )}

      <header className="job-detail__header">
        <span className="job-detail__logo">
          <SmartImg
            src={job.image_url}
            alt=""
            seed={job.id}
            fallback={<span className="job-detail__logo-initial">{job.company.charAt(0)}</span>}
          />
        </span>
        <div className="job-detail__head-meta">
          <h1 className="job-detail__title">{job.title}</h1>
          <p className="job-detail__company">
            {job.company}
            {source && <span className="job-detail__source">via {source}</span>}
          </p>
        </div>
      </header>

      <div className="job-detail__actions-bar">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
        >
          <ExternalLink size={14} style={{ marginRight: 8 }} />
          Apply on original site
        </a>
        <button
          type="button"
          onClick={toggleSave}
          disabled={saving}
          className={"row-icon-btn" + (saved ? " row-icon-btn--on" : "")}
          aria-label={saved ? "Unsave" : "Save"}
          aria-pressed={saved}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </button>
        <div className="overflow-wrap">
          <button
            type="button"
            className="row-icon-btn"
            onClick={() => setShareOpen((v) => !v)}
            aria-label="Share"
          >
            <Share2 size={16} />
          </button>
          {shareOpen && (
            <div className="menu">
              <button type="button" className="menu__item" onClick={copyLink}>Copy link</button>
            </div>
          )}
        </div>
      </div>

      {facts.length > 0 && (
        <dl className="job-detail__facts">
          {facts.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label}>
                <dt><Icon size={12} /> {f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            );
          })}
        </dl>
      )}

      {job.skills && job.skills.length > 0 && (
        <section className="job-detail__section">
          <h2 className="job-detail__section-title">Skills</h2>
          <div className="job-detail__skills">
            {job.skills.map((s, i) => (
              <span key={i} className="cat-chip">{s}</span>
            ))}
          </div>
        </section>
      )}

      {job.description && (
        <section className="job-detail__section">
          <h2 className="job-detail__section-title">About this role</h2>
          <StructuredDescription content={job.description} />
        </section>
      )}

      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />

      {similarJobs.length > 0 && (
        <section className="job-detail__section">
          <h2 className="job-detail__section-title">Similar jobs</h2>
          <div className="row-list">
            {similarJobs.map((j) => (
              <Link key={j.id} href={"/jobs/" + j.id} className="row job-row">
                <span className="job-row__logo">
                  <SmartImg
                    src={j.image_url}
                    alt=""
                    seed={j.id}
                    fallback={<span className="job-row__logo-initial">{j.company.charAt(0)}</span>}
                  />
                </span>
                <div className="job-row__body">
                  <p className="row-title">{j.title}</p>
                  <div className="row-meta">
                    <span>{j.company}</span>
                    {j.location && <><span className="row-dot">·</span><span>{j.location}</span></>}
                    {j.employment_type && <><span className="row-dot">·</span><span>{j.employment_type}</span></>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
