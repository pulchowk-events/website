import Link from 'next/link';
import JobImage from './JobImage';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { formatDateShort } from '@/app/lib/formatDate';
import Markdown from '@/app/components/ui/Markdown';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string | null;
  location: string | null;
  salary: string | null;
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

const SOURCE_LABELS: Record<string, string> = {
  merojob: 'Merojob',
  sathijob: 'SathiJob',
  internsathi: 'InternSathi',
  kumarijob: 'KumariJob',
};

function formatSourceLabel(origin: string): string | null {
  if (!origin.startsWith('scraper:')) return null;
  const key = origin.slice('scraper:'.length);
  return SOURCE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

export default function JobDetail({ job }: { job: Job }) {
  const sourceLabel = formatSourceLabel(job.origin);
  const isExpired = job.application_ends_at && new Date(job.application_ends_at) < new Date();

  const metaItems: { icon: any; label: string; value: string | null }[] = [
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Briefcase, label: 'Employment type', value: job.employment_type },
    { icon: DollarSign, label: 'Salary', value: job.salary },
    { icon: TrendingUp, label: 'Experience', value: job.experience },
    { icon: TrendingUp, label: 'Level', value: job.level },
    { icon: Users, label: 'Openings', value: job.openings ? String(job.openings) : null },
    { icon: Clock, label: 'Work mode', value: job.attendance_mode },
    {
      icon: Calendar,
      label: 'Apply by',
      value: job.application_ends_raw
        ? job.application_ends_raw
        : job.application_ends_at
          ? formatDateShort(job.application_ends_at)
          : null,
    },
  ].filter((m) => m.value);

  return (
    <article className="job-detail">
      <Link href="/jobs" className="event-detail__back">
        <ArrowLeft size={14} />
        Back to Jobs
      </Link>

      {isExpired && (
        <div className="job-detail__expired">
          This job&rsquo;s application deadline has passed. You can still view the details below for reference.
        </div>
      )}

      <header className="job-detail__header">
        <div className="job-detail__head">
          <div className="job-detail__logo">
            <JobImage src={job.image_url} alt={job.company} jobId={job.id} />
          </div>
          <div className="job-detail__head-text">
            <h1 className="job-detail__title">{job.title}</h1>
            <p className="job-detail__company">{job.company}</p>
            {sourceLabel && <p className="job-detail__source">via {sourceLabel}</p>}
          </div>
        </div>

        {metaItems.length > 0 && (
          <dl className="job-detail__dl">
            {metaItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  <dt className="event-detail__dt">
                    <Icon size={12} />
                    {item.label}
                  </dt>
                  <dd className="event-detail__dd">{item.value}</dd>
                </div>
              );
            })}
          </dl>
        )}
      </header>

      {job.skills && job.skills.length > 0 && (
        <section className="job-detail__section">
          <h2 className="job-detail__section-title">Skills</h2>
          <div className="tabs">
            {job.skills.map((skill, i) => (
              <span key={i} className="tab" style={{ pointerEvents: 'none' }}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {job.description && (
        <section className="job-detail__section">
          <h2 className="job-detail__section-title">About this role</h2>
          <Markdown content={job.description} />
        </section>
      )}

      <div className="job-detail__cta-row">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary job-detail__cta"
        >
          <span className="btn__label">
            <ExternalLink size={16} style={{ marginRight: 8 }} />
            View on {sourceLabel || 'Original Site'}
          </span>
          <span className="btn__label btn__label--dup" aria-hidden="true">
            <ExternalLink size={16} style={{ marginRight: 8 }} />
            View on {sourceLabel || 'Original Site'}
          </span>
        </a>
      </div>
    </article>
  );
}
