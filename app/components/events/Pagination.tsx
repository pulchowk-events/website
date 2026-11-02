import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  buildUrl: (page: number) => string;
}

export default function Pagination({ page, totalPages, buildUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Show up to 5 page numbers around current page
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
    <nav
      className="flex items-center justify-center gap-1 mt-8"
      aria-label="Pagination"
    >
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={buildUrl(page - 1)}
          rel="prev"
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-accent transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {/* First page + ellipsis */}
      {start > 1 && (
        <>
          <Link
            href={buildUrl(1)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-accent transition-colors"
          >
            1
          </Link>
          {start > 2 && (
            <span className="px-2 text-muted-foreground">…</span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pages.map((p) => {
        const active = p === page;
        return (
          <Link
            key={p}
            href={buildUrl(p)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-green-600 text-white'
                : 'bg-muted text-foreground hover:bg-accent'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {p}
          </Link>
        );
      })}

      {/* Last page + ellipsis */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-2 text-muted-foreground">…</span>
          )}
          <Link
            href={buildUrl(totalPages)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-accent transition-colors"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildUrl(page + 1)}
          rel="next"
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-accent transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}