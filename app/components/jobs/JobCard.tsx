import Link from 'next/link';
import JobImage from './JobImage';
import { MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  employment_type: string | null;
  attendance_mode: string | null;
  image_url: string | null;
  posted_at: string | null;
  application_ends_raw: string | null;
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

export default function JobCard({ job }: { job: Job }) {
  const sourceLabel = formatSourceLabel(job.origin);

  return (
    <Link href={'/jobs/' + job.id} className="job-card">
      <div className="job-card__logo">
        <JobImage src={job.image_url} alt={job.company} jobId={job.id} />
      </div>

      <div className="job-card__body">
        <div className="job-card__head">
          <h3 className="job-card__title">{job.title}</h3>
          {sourceLabel && <span className="job-card__source">via {sourceLabel}</span>}
        </div>
        <p className="job-card__company">{job.company}</p>

        <div className="job-card__meta">
          {job.location && (
            <span className="job-card__meta-item">
              <MapPin size={14} />
              <span className="job-card__truncate">{job.location}</span>
            </span>
          )}
          {job.employment_type && (
            <span className="job-card__meta-item">
              <Briefcase size={14} />
              <span>{job.employment_type}</span>
            </span>
          )}
          {job.salary && (
            <span className="job-card__meta-item">
              <DollarSign size={14} />
              <span className="job-card__truncate">{job.salary}</span>
            </span>
          )}
          {job.application_ends_raw && (
            <span className="job-card__meta-item">
              <Calendar size={14} />
              <span className="job-card__truncate">Apply by {job.application_ends_raw}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
