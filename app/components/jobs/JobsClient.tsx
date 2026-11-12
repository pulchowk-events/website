"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { JobRow } from "./JobRow";
import { JobDetailSheet } from "./JobDetailSheet";

interface Props {
  jobs: any[];
  totalCount: number;
  savedIds: string[];
  page: number;
  totalPages: number;
}

export function JobsClient({ jobs, totalCount, savedIds, page, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(null);
  const savedSet = new Set(savedIds);

  useEffect(() => {
    const id = searchParams.get("id");
    setOpenId(id);
  }, [searchParams]);

  const openJob = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", id);
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const closeJob = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    const qs = params.toString();
    router.push(pathname + (qs ? "?" + qs : ""), { scroll: false });
  };

  const selectedJob = openId ? jobs.find((j) => j.id === openId) : null;

  return (
    <>
      {jobs.length === 0 ? (
        <div className="empty-row" style={{ marginTop: 16 }}>
          <p>No jobs match these filters.</p>
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="btn btn--secondary btn--sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              saved={savedSet.has(job.id)}
              selected={openId === job.id}
              onClick={() => openJob(job.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="jobs-pager">
          <span className="jobs-pager__label">Page {page} of {totalPages}</span>
          <div className="jobs-pager__actions">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(Math.max(1, page - 1)));
                params.delete("id");
                router.push(pathname + "?" + params.toString());
              }}
              disabled={page === 1}
              className="btn btn--secondary btn--sm"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(Math.min(totalPages, page + 1)));
                params.delete("id");
                router.push(pathname + "?" + params.toString());
              }}
              disabled={page === totalPages}
              className="btn btn--secondary btn--sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedJob && (
        <JobDetailSheet
          job={selectedJob}
          saved={savedSet.has(selectedJob.id)}
          onClose={closeJob}
        />
      )}
    </>
  );
}
