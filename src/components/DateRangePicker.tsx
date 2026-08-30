"use client";

import { CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";

export type DateRange = { from: string; to: string };

/**
 * Two date inputs plus the presets an operator actually reaches for.
 *
 * Both bounds are inclusive from the reader's point of view — the API is given
 * an exclusive upper bound internally so "to 31 Jan" includes everything that
 * happened on the 31st, rather than stopping at midnight as it began.
 */
const PRESETS: { label: string; days: number }[] = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

function isoDay(d: Date) {
  // Local calendar date, not UTC: an operator in Lagos picking "today" means
  // their today, and toISOString() would roll back a day before 01:00.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function presetRange(days: number): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: isoDay(from), to: isoDay(to) };
}

export default function DateRangePicker({
  from,
  to,
  onChange,
  className,
}: {
  from: string;
  to: string;
  onChange: (range: DateRange) => void;
  className?: string;
}) {
  const active = Boolean(from || to);
  const today = isoDay(new Date());

  const field = cn(
    "h-9 rounded-lg border border-input bg-card px-2.5 text-base text-foreground",
    "transition-[box-shadow,border-color] focus:border-primary focus:ring-3 focus:ring-ring",
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="flex items-center gap-1.5 text-sm text-secondary-foreground">
        <CalendarDaysIcon className="size-4" aria-hidden />
        Range
      </span>

      <input
        type="date"
        aria-label="From date"
        value={from}
        // Never let the start pass the end; the API swaps a reversed range,
        // but showing an impossible one in the UI is still a bug.
        max={to || today}
        onChange={(e) => onChange({ from: e.target.value, to })}
        className={field}
      />
      <span className="text-sm text-muted-foreground">to</span>
      <input
        type="date"
        aria-label="To date"
        value={to}
        min={from || undefined}
        max={today}
        onChange={(e) => onChange({ from, to: e.target.value })}
        className={field}
      />

      <div className="flex items-center gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange(presetRange(p.days))}
            className="rounded-md border border-input bg-card px-2 py-1 text-sm font-medium text-secondary-foreground transition-colors hover:bg-card-muted hover:text-foreground"
          >
            {p.label}
          </button>
        ))}
        {active && (
          <button
            type="button"
            onClick={() => onChange({ from: "", to: "" })}
            aria-label="Clear date range"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <XMarkIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
