import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
    <Link href={`/jobs/${job.id}`}>
      <article className="bg-card border border-border rounded-xl p-5 hover:border-green-500/50 hover:shadow-lg transition-all group">
        <div className="flex items-start gap-4">
          {/* Company logo */}
          <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
            {job.image_url ? (
              <Image
                src={job.image_url}
                alt={job.company}
                width={56}
                height={56}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold text-lg">
                {job.company.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1">
                {job.title}
              </h3>
              {sourceLabel && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  via {sourceLabel}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground mb-3">{job.company}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {job.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
              )}
              {job.employment_type && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span>{job.employment_type}</span>
                </div>
              )}
              {job.salary && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{job.salary}</span>
                </div>
              )}
              {job.application_ends_raw && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Apply by {job.application_ends_raw}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}