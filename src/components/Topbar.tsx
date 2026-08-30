"use client";

import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  BellIcon,
  ChevronRightIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import Button, { ButtonLink } from "./Button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "./AuthProvider";
import { useLayout } from "./LayoutContext";
import { isActive, navLinks } from "./Sidebar";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { dense, toggleDense, setMobileOpen } = useLayout();

  // Longest match wins so "/riders/12" reads as Riders rather than falling
  // back to the dashboard.
  const current = navLinks
    .filter((l) => isActive(pathname, l.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const isDetail = current ? pathname !== current.href : false;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="md:hidden"
      >
        <Bars3Icon />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDense}
        aria-label={dense ? "Expand sidebar" : "Collapse sidebar"}
        title={dense ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden md:inline-flex"
      >
        <ViewColumnsIcon />
      </Button>

      {/* Breadcrumb — the only orientation cue once the sidebar is a 72px
          rail of unlabelled icons. */}
      <nav aria-label="Breadcrumb" className="ml-1 flex min-w-0 items-center gap-1.5">
        <span className="truncate text-base font-semibold text-foreground">
          {current?.label ?? "QuickCarry"}
        </span>
        {isDetail && (
          <>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="tnum truncate text-base text-secondary-foreground">
              {pathname.split("/").filter(Boolean).slice(-1)[0]}
            </span>
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        {/* Points at the audit trail rather than a notifications feed the API
            does not have: an icon that does nothing is worse than no icon. */}
        <ButtonLink
          href="/audit"
          variant="ghost"
          size="icon"
          aria-label="Recent admin activity"
          title="Recent admin activity"
        >
          <BellIcon />
        </ButtonLink>

        <div className="ml-2 flex items-center gap-2.5 border-l border-border pl-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-accent">
            {initials(user?.full_name ?? "?")}
          </span>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-base font-medium leading-tight text-foreground">
              {user?.full_name}
            </p>
            <p className="truncate text-sm leading-tight text-secondary-foreground">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
