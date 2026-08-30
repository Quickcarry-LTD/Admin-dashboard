"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowLeftOnRectangleIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SignalIcon,
  Squares2X2Icon,
  TicketIcon,
  TruckIcon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";
import { useAuth } from "./AuthProvider";
import { useLayout } from "./LayoutContext";

// Grouped rather than flat: fifteen links in one column is a wall, and the
// headings give the eye somewhere to land. Every entry maps to a real
// endpoint group in internal/httpapi/router.go's /admin section.
export const navGroups = [
  {
    heading: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: Squares2X2Icon }],
  },
  {
    heading: "Operations",
    items: [
      { href: "/deliveries", label: "Deliveries", icon: TruckIcon },
      { href: "/live", label: "Live fleet", icon: SignalIcon },
      { href: "/complaints", label: "Complaints", icon: ChatBubbleLeftRightIcon },
    ],
  },
  {
    heading: "People",
    items: [
      { href: "/riders", label: "Riders", icon: UsersIcon },
      { href: "/customers", label: "Customers", icon: UserGroupIcon },
      { href: "/merchants", label: "Merchants", icon: BuildingStorefrontIcon },
    ],
  },
  {
    heading: "Commerce",
    items: [{ href: "/marketplace", label: "Marketplace", icon: ShoppingBagIcon }],
  },
  {
    heading: "Finance",
    items: [
      { href: "/payments", label: "Payments", icon: CreditCardIcon },
      { href: "/withdrawals", label: "Withdrawals", icon: BanknotesIcon },
    ],
  },
  {
    heading: "Configuration",
    items: [
      { href: "/coupons", label: "Coupons", icon: TicketIcon },
      { href: "/settings", label: "Settings", icon: Cog6ToothIcon },
      { href: "/audit", label: "Audit trail", icon: ShieldCheckIcon },
    ],
  },
];

export const navLinks = navGroups.flatMap((g) => g.items);

export function isActive(pathname: string, href: string) {
  // "/" prefixes everything, so the dashboard link would light up on every
  // page — it is the one entry that must match exactly.
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ dense }: { dense: boolean }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { setMobileOpen } = useLayout();

  return (
    <div className="flex h-full flex-col bg-card">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2.5 border-b border-border",
          dense ? "justify-center px-2" : "px-5",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white p-1 dark:ring-1 dark:ring-white/10">
          <Image
            src="/logo-icon.png"
            alt=""
            width={378}
            height={253}
            className="h-full w-auto"
            priority
          />
        </span>
        {!dense && (
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-tight text-foreground">
              QuickCarry
            </p>
            <p className="truncate text-sm leading-tight text-secondary-foreground">Admin</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="ml-auto rounded-lg p-1.5 text-secondary-foreground hover:bg-card-muted md:hidden"
        >
          <XMarkIcon className="size-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.heading} className="mb-5 last:mb-0">
            <p
              className={cn(
                "mb-1.5 px-3 text-sm font-medium uppercase tracking-wider text-muted-foreground",
                dense && "sr-only",
              )}
            >
              {group.heading}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={dense ? label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                        dense && "justify-center px-0",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-secondary-foreground hover:bg-card-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      {!dense && <span className="truncate">{label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        {!dense && (
          <div className="px-2 pb-2">
            <p className="truncate text-base font-medium text-foreground">
              {user?.full_name ?? "—"}
            </p>
            <p className="truncate text-sm text-secondary-foreground">{user?.email}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          title={dense ? "Sign out" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium",
            "text-secondary-foreground transition-colors hover:bg-card-muted hover:text-foreground",
            dense && "justify-center px-0",
          )}
        >
          <ArrowLeftOnRectangleIcon className="size-5 shrink-0" />
          {!dense && "Sign out"}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { dense, mobileOpen, setMobileOpen } = useLayout();

  // Close the drawer on navigation, otherwise it stays open on top of the
  // page the user just chose.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, setMobileOpen]);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border transition-[width] duration-300 ease-in-out md:block",
          dense ? "w-[72px]" : "w-[264px]",
        )}
      >
        <div className="sticky top-0 h-screen">
          <SidebarContent dense={dense} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[264px] border-r border-border transition-transform duration-300 ease-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent dense={false} />
      </aside>
    </>
  );
}
