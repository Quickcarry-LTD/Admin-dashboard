"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";

/**
 * The search box on every list page.
 *
 * It debounces, because each keystroke is a round trip to the API and an
 * operator typing an eleven-digit phone number would otherwise fire eleven
 * queries and race their responses. The visible value updates immediately so
 * typing never feels laggy; only the committed value is debounced.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  delay = 300,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  // Re-sync when the parent resets the query (clearing all filters, say).
  // Adjusted during render rather than in an effect: React supports this for
  // deriving state from props, and an effect here would cost a second render
  // pass on every keystroke round trip.
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;
    const id = setTimeout(() => onChange(draft), delay);
    return () => clearTimeout(id);
    // `value` is intentionally excluded: including it would restart the timer
    // when the committed value catches up, and the guard above already covers
    // the equal case.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, delay, onChange]);

  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3",
        "transition-[box-shadow,border-color] focus-within:border-primary focus-within:ring-3 focus-within:ring-ring",
        className,
      )}
    >
      <MagnifyingGlassIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-base text-foreground outline-none",
          "placeholder:text-muted-foreground",
          // The native clear affordance clashes with ours.
          "[&::-webkit-search-cancel-button]:appearance-none",
        )}
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onChange("");
          }}
          aria-label="Clear search"
          className="shrink-0 rounded text-muted-foreground transition-colors hover:text-foreground"
        >
          <XMarkIcon className="size-4" />
        </button>
      )}
    </div>
  );
}

/** The filter pill used beside the search box on list toolbars. */
export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-medium capitalize transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-card text-secondary-foreground hover:bg-card-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
