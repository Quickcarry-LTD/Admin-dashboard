import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const styles = {
    error: "border-danger/30 bg-danger-soft text-danger",
    success: "border-success/30 bg-success-soft text-success",
    info: "border-info/30 bg-info-soft text-info",
  }[tone];
  const Icon = tone === "success" ? CheckCircleIcon : ExclamationTriangleIcon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-base", styles)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        className ?? "size-4",
      )}
    />
  );
}

/* ---------------------------------------------------------------------------
   Skeletons

   A spinner says "something is happening". A skeleton shaped like the content
   says "a table of six rows is coming", which stops the page reflowing under
   the reader when it lands. Each of these mirrors the layout it stands in for.
   --------------------------------------------------------------------------- */

/** The base shimmer block everything else is composed from. */
export function Shimmer({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={cn("animate-pulse rounded bg-border", className)} style={style} />;
}

/** One label/value line, as used inside detail panels. */
export function RowSkeleton({
  labelWidth = "w-24",
  valueWidth = "w-40",
}: {
  labelWidth?: string;
  valueWidth?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <Shimmer className={cn("h-3.5", labelWidth)} />
      <Shimmer className={cn("h-3.5", valueWidth)} />
    </div>
  );
}

/** A panel of label/value rows. */
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card p-5 shadow-card">
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

/** A KPI tile. Matches StatCard's geometry so the grid does not jump. */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="size-9 rounded-xl" />
      </div>
      <Shimmer className="mt-4 h-7 w-32" />
      <Shimmer className="mt-2 h-3 w-20" />
    </div>
  );
}

/** Table rows on desktop, card rows on mobile — same breakpoint as RecordList. */
export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Shimmer
              key={c}
              className={cn(
                "h-3.5",
                c === 0 ? "w-32" : c === columns - 1 ? "ml-auto w-16" : "hidden w-24 md:block",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** A chart panel's plot area. */
export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {[45, 70, 55, 90, 65, 80, 50].map((h, i) => (
        <Shimmer key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-base text-secondary-foreground">
      <Spinner />
      {label}
    </div>
  );
}

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
}: {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-card-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <p className="text-xl font-semibold tracking-tight text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-base leading-relaxed text-secondary-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
