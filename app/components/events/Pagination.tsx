import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  buildUrl: (page: number) => string;
}

export default function Pagination({ page, totalPages, buildUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav className="pagination" aria-label="Pagination">
      {hasPrev ? (
        <Link href={buildUrl(page - 1)} rel="prev" className="pagination__nav" aria-label="Previous page">
          <ChevronLeft size={14} />
          <span className="pagination__label">Previous</span>
        </Link>
      ) : (
        <span className="pagination__nav pagination__nav--off" aria-disabled="true">
          <ChevronLeft size={14} />
          <span className="pagination__label">Previous</span>
        </span>
      )}

      {start > 1 && (
        <>
          <Link href={buildUrl(1)} className="tab">{1}</Link>
          {start > 2 && <span className="pagination__gap">…</span>}
        </>
      )}

      {pages.map((p) => {
        const active = p === page;
        return (
          <Link
            key={p}
            href={buildUrl(p)}
            className={'tab' + (active ? ' tab--on' : '')}
            aria-current={active ? 'page' : undefined}
          >
            {p}
          </Link>
        );
      })}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="pagination__gap">…</span>}
          <Link href={buildUrl(totalPages)} className="tab">{totalPages}</Link>
        </>
      )}

      {hasNext ? (
        <Link href={buildUrl(page + 1)} rel="next" className="pagination__nav" aria-label="Next page">
          <span className="pagination__label">Next</span>
          <ChevronRight size={14} />
        </Link>
      ) : (
        <span className="pagination__nav pagination__nav--off" aria-disabled="true">
          <span className="pagination__label">Next</span>
          <ChevronRight size={14} />
        </span>
      )}
    </nav>
  );
}
