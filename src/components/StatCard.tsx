import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowDownRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/cn";

export type StatTone = "brand" | "info" | "success" | "warning" | "danger" | "neutral";

const TONES: Record<StatTone, string> = {
  brand: "bg-primary-soft text-primary-accent",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-neutral-soft text-neutral",
};

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: StatTone;
  /** Signed percentage. Renders a direction-aware trend chip when present. */
  delta?: number;
  deltaLabel?: string;
  /** Turns the whole tile into a link — used for the queue tiles. */
  href?: string;
  /**
   * Draws attention when a number needs action (an unpaid queue, a balance
   * under threshold). brails does this by flipping the whole card red; here
   * it's a left accent bar so a row of tiles stays readable.
   */
  alert?: boolean;
}

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "brand",
  delta,
  deltaLabel = "vs last week",
  href,
  alert,
}: StatCardProps) {
  const isUp = (delta ?? 0) >= 0;
  const TrendIcon = isUp ? ArrowUpRightIcon : ArrowDownRightIcon;

  const body = (
    <>
      {alert && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-warning"
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <p className="truncate text-base font-medium text-secondary-foreground">{label}</p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            TONES[tone],
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>

      <p className="tnum mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
              isUp ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
            )}
          >
            <TrendIcon className="size-3" />
            {Math.abs(delta)}%
          </span>
        )}
        {(sub || delta !== undefined) && (
          <span className="truncate text-secondary-foreground">
            {delta !== undefined ? deltaLabel : sub}
          </span>
        )}
      </div>
    </>
  );

  const className = cn(
    "relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card",
    href && "transition-shadow hover:shadow-card-hover",
  );

  return href ? (
    <Link href={href} className={cn(className, "block")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
