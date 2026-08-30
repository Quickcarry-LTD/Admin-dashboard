"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import Panel from "./Panel";
import Pagination from "./Pagination";
import { Alert, EmptyState, TableSkeleton } from "./Feedback";

/**
 * The shape every list page shares: a titled Panel whose body is either the
 * loading skeleton, the error, the empty state, or the rows — with pagination
 * pinned underneath when there are rows.
 *
 * Factored out because there are eight of these and the four-way branch is
 * exactly what rots when written eight times: one page forgets the error case,
 * another shows an empty table instead of an empty state.
 */
export default function ListPanel({
  title,
  action,
  toolbar,
  loading,
  error,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  skeletonColumns = 5,
  page,
  limit,
  total,
  onPageChange,
  children,
}: {
  title: string;
  action?: ReactNode;
  /** Filters and exports — rendered above the rows, inside the panel. */
  toolbar?: ReactNode;
  loading: boolean;
  error: string;
  isEmpty: boolean;
  emptyIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  emptyTitle: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  skeletonColumns?: number;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  children: ReactNode;
}) {
  return (
    <Panel title={title} action={action} bodyClassName="">
      {toolbar && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
          {toolbar}
        </div>
      )}

      {error ? (
        <div className="p-5">
          <Alert>{error}</Alert>
        </div>
      ) : loading ? (
        // Shaped like the table it precedes, so the panel does not resize
        // under the reader when the rows arrive.
        <TableSkeleton columns={skeletonColumns} />
      ) : isEmpty ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <>
          {children}
          <Pagination page={page} limit={limit} total={total} onPageChange={onPageChange} />
        </>
      )}
    </Panel>
  );
}
