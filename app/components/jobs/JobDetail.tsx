import Link from 'next/link';
import Image from 'next/image';
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
import { format } from 'date-fns';
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
  const isExpired =
    job.application_ends_at && new Date(job.application_ends_at) < new Date();

  const metaItems: { icon: any; label: string; value: string | null }[] = [
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Briefcase, label: 'Employment Type', value: job.employment_type },
    { icon: DollarSign, label: 'Salary', value: job.salary },
    { icon: TrendingUp, label: 'Experience', value: job.experience },
    { icon: TrendingUp, label: 'Level', value: job.level },
    { icon: Users, label: 'Openings', value: job.openings ? String(job.openings) : null },
    { icon: Clock, label: 'Work Mode', value: job.attendance_mode },
    {
      icon: Calendar,
      label: 'Apply By',
      value: job.application_ends_raw
        ? job.application_ends_raw
        : job.application_ends_at
          ? format(new Date(job.application_ends_at), 'MMM d, yyyy')
          : null,
    },
  ].filter((m) => m.value);

  return (
    <article className="space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      {isExpired && (
        <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-xl p-4 text-sm">
          This job&apos;s application deadline has passed. You can still view the
          details below for reference.
        </div>
      )}

      {/* Header */}
      <header className="bg-card border border-border rounded-xl p-6 sm:p-8">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-20 h-20 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
            {job.image_url ? (
              <Image
                src={job.image_url}
                alt={job.company}
                width={80}
                height={80}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold text-2xl">
                {job.company.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {job.title}
            </h1>
            <p className="text-lg font-medium text-foreground mb-2">{job.company}</p>
            {sourceLabel && (
              <p className="text-xs text-muted-foreground">via {sourceLabel}</p>
            )}
          </div>
        </div>

        {/* Meta grid */}
        {metaItems.length > 0 && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border">
            {metaItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </dt>
                  <dd className="text-sm text-foreground">{item.value}</dd>
                </div>
              );
            })}
          </dl>
        )}
      </header>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center bg-muted text-foreground px-3 py-1.5 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

        {/* Description */}
        {job.description && (
        <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">About this role</h2>
            <Markdown content={job.description} />
        </section>
        )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View on {sourceLabel || 'Original Site'}
        </a>
      </div>
    </article>
  );
}