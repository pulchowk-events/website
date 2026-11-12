import Link from "next/link";
import Image from "next/image";
import { formatDateShort } from "@/app/lib/formatDate";

interface JobRowProps {
  job: {
    id: string;
    title: string;
    company: string;
    location?: string | null;
    employment_type?: string | null;
    salary?: string | null;
    posted_at?: string | null;
    image_url?: string | null;
  };
  compact?: boolean;
}

export function JobRow({ job, compact = false }: JobRowProps) {
  return (
    <Link href={"/jobs/" + job.id} className={"row job-row" + (compact ? " job-row--compact" : "")}>
      {!compact && (
        <span className="job-row__logo">
          {job.image_url ? (
            <Image src={job.image_url} alt="" width={40} height={40} unoptimized />
          ) : (
            <span className="job-row__logo-initial">{job.company.charAt(0)}</span>
          )}
        </span>
      )}
      <div className="job-row__body">
        <p className="row-title">{job.title}</p>
        <div className="row-meta">
          <span>{job.company}</span>
          {job.location && <><span className="row-dot">·</span><span>{job.location}</span></>}
          {job.employment_type && <><span className="row-dot">·</span><span>{job.employment_type}</span></>}
        </div>
      </div>
      {!compact && job.posted_at && (
        <span className="job-row__posted">{formatDateShort(job.posted_at)}</span>
      )}
    </Link>
  );
}
