import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The dashboard's one container: white card, soft elevation, generously
 * rounded. Every panel on a page is one of these, so the slate page ground
 * only ever shows as gutter between them.
 */
export default function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          )}
          {action}
        </header>
      )}
      <div className={bodyClassName ?? "p-5"}>{children}</div>
    </section>
  );
}

/**
 * The title block at the top of a page. `eyebrow` names the section the page
 * belongs to, which is what keeps a fifteen-page admin navigable once you
 * arrive by deep link rather than through the sidebar.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-accent">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-2 text-base leading-relaxed text-secondary-foreground">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

/**
 * A label/value row, the unit every detail panel is built from. Used enough
 * across the detail pages that the alignment and divider live here rather
 * than being retyped per page.
 */
export function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0",
        className,
      )}
    >
      <span className="shrink-0 text-base text-secondary-foreground">{label}</span>
      <span className="min-w-0 break-words text-right text-base font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
