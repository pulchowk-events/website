"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ScholarshipRow } from "./ScholarshipRow";
import type { Scholarship } from "@/app/lib/queries";

interface Props {
  scholarships: Scholarship[];
  page: number;
  totalPages: number;
}

export function ScholarshipsClient({ scholarships, page, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const go = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(pathname + "?" + params.toString());
  };

  if (scholarships.length === 0) {
    return (
      <div className="empty-row" style={{ marginTop: 16 }}>
        <p>No scholarships match these filters.</p>
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="btn btn--secondary btn--sm"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="row-list">
        {scholarships.map((s) => (
          <ScholarshipRow key={s.id} scholarship={s} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="jobs-pager">
          <span className="jobs-pager__label">Page {page} of {totalPages}</span>
          <div className="jobs-pager__actions">
            <button
              type="button"
              onClick={() => go(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn btn--secondary btn--sm"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => go(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn btn--secondary btn--sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
