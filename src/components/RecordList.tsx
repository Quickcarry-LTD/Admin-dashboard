"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * One row definition, two renderings.
 *
 * A seven-column table at 390px is not "responsive" just because it scrolls:
 * status, price and the open button end up behind a horizontal scroll with no
 * visible affordance, so the most important column is the invisible one.
 *
 * Below `md` (960px, Material's breakpoint) each row becomes a card —
 * headline, badge, then the fields as label/value pairs — and above it stays
 * the dense table that works on a desk. Both come from the same `fields`
 * array, so a column cannot be added to one view and forgotten in the other.
 */
export type Field<T> = {
  key: string;
  label: string;
  align?: "left" | "right";
  /**
   * Drop this field from the mobile card. Use it for anything the card's
   * title or badge already says — repeating them wastes the narrow column.
   */
  card?: false;
  /**
   * Drop this field from the desktop table. The card has vertical room the
   * table does not: too many columns push the action buttons past the right
   * edge, where `overflow-x-auto` clips them with no visible scrollbar.
   */
  table?: false;
  cellClassName?: string;
  render: (row: T) => ReactNode;
};

interface RecordListProps<T> {
  rows: T[];
  fields: Field<T>[];
  getKey: (row: T) => string;
  cardTitle: (row: T) => ReactNode;
  cardSubtitle?: (row: T) => ReactNode;
  cardBadge?: (row: T) => ReactNode;
  /** Makes the whole card tappable and adds a chevron column to the table. */
  href?: (row: T) => string;
  actions?: (row: T) => ReactNode;
  minWidth?: number;
}

export default function RecordList<T>({
  rows,
  fields,
  getKey,
  cardTitle,
  cardSubtitle,
  cardBadge,
  href,
  actions,
  minWidth = 720,
}: RecordListProps<T>) {
  const cardFields = fields.filter((f) => f.card !== false);
  const tableFields = fields.filter((f) => f.table !== false);

  return (
    <>
      {/* ---------- Below md: cards ---------- */}
      <ul className="divide-y divide-border md:hidden">
        {rows.map((row) => {
          const head = (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base font-semibold text-foreground">{cardTitle(row)}</div>
                {cardSubtitle && (
                  <div className="mt-0.5 truncate text-sm text-secondary-foreground">
                    {cardSubtitle(row)}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {cardBadge?.(row)}
                {href && <ChevronRightIcon className="size-4 text-muted-foreground" />}
              </div>
            </div>
          );

          return (
            <li key={getKey(row)}>
              <div className="px-5 py-4">
                {href ? (
                  <Link href={href(row)} className="block">
                    {head}
                  </Link>
                ) : (
                  head
                )}

                <dl className="mt-3 flex flex-col gap-2">
                  {cardFields.map((field) => (
                    <div key={field.key} className="flex items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-sm text-secondary-foreground">
                        {field.label}
                      </dt>
                      <dd className="min-w-0 text-right text-base text-foreground">
                        {field.render(row)}
                      </dd>
                    </div>
                  ))}
                </dl>

                {actions && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                    {actions(row)}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* ---------- md and up: table ---------- */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left" style={{ minWidth: `${minWidth}px` }}>
          <thead className="bg-card-muted">
            <tr className="border-b border-border">
              {tableFields.map((field) => (
                <th
                  key={field.key}
                  scope="col"
                  className={cn(
                    "px-5 py-3 text-sm font-medium text-secondary-foreground",
                    field.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {field.label}
                </th>
              ))}
              {(actions || href) && <th scope="col" className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getKey(row)}
                className="border-b border-border transition-colors last:border-b-0 hover:bg-card-muted"
              >
                {tableFields.map((field) => (
                  <td
                    key={field.key}
                    className={cn(
                      "px-5 py-3.5 align-middle text-base text-foreground",
                      field.align === "right" && "text-right",
                      field.cellClassName,
                    )}
                  >
                    {field.render(row)}
                  </td>
                ))}
                {(actions || href) && (
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {actions?.(row)}
                      {href && (
                        <Link
                          href={href(row)}
                          aria-label="Open"
                          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-input bg-card text-secondary-foreground transition-colors hover:bg-card-muted hover:text-foreground"
                        >
                          <ChevronRightIcon className="size-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
