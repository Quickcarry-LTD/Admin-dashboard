"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";

/**
 * The API's dto.Page gives page/limit/total but no page count — it's derived
 * here rather than guessed from a short final page.
 */
export default function Pagination({
  page,
  limit,
  total,
  onPageChange,
}: {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const lastPage = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  if (total === 0) return null;

  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  const step = cn(
    "flex size-8 items-center justify-center rounded-lg border border-input bg-card",
    "text-secondary-foreground transition-colors hover:bg-card-muted hover:text-foreground",
    "disabled:pointer-events-none disabled:opacity-40",
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
      <p className="tnum text-base text-secondary-foreground">
        Showing <span className="font-medium text-foreground">{first}</span>&ndash;
        <span className="font-medium text-foreground">{last}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={step}
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <span className="tnum px-1 text-base text-secondary-foreground">
          {page} / {lastPage}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
          className={step}
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
