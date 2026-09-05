import { ChevronLeft, ChevronRight } from "lucide-react";

function getPages(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("…");
  pages.push(totalPages);
  return pages;
}

const PAGE_BTN =
  "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

export function Pagination({ page, totalPages, total, pageSize = 10, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = getPages(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row">
      <p className="text-xs text-slate-500 sm:text-sm">
        Showing <span className="font-medium text-slate-700">{from}</span>–
        <span className="font-medium text-slate-700">{to}</span> of{" "}
        <span className="font-medium text-slate-700">{total}</span>
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button type="button" className={PAGE_BTN} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        {pages.map((p, index) =>
          p === "…" ? (
            <span key={`ellipsis-${index}`} className="px-1.5 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-indigo-600 px-2 text-sm font-medium text-white"
                  : PAGE_BTN
              }
            >
              {p}
            </button>
          )
        )}
        <button type="button" className={PAGE_BTN} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
