// ===============================================
// File: Sidebar.tsx
//
// Purpose:
// The persistent left sidebar nav, matching the Figma admin panel:
// QuickCarry logo header, full nav link list (Dashboard/Orders/
// Riders/Customers/Vehicles/Wallet & Payments/Earnings/Reports &
// Analytics/Live Tracking/Notifications/Promotions/Support Tickets/
// Settings/Users & Roles), and a System Status card pinned to the
// bottom.
//
// Responsibilities:
// - Render every nav link with an active-state highlight
// - Render the System Status card (server uptime, API status, etc.)
// ===============================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  Home,
  ClipboardList,
  Users,
  UserCog,
  Car,
  Wallet,
  TrendingUp,
  BarChart3,
  MapPin,
  Bell,
  Megaphone,
  LifeBuoy,
  Settings,
  ShieldCheck,
} from "lucide-react";

// One nav link's definition — href + icon + label, matching the Figma exactly
const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/riders", label: "Riders", icon: Users },
  { href: "/customers", label: "Customers", icon: UserCog },
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/wallet", label: "Wallet & Payments", icon: Wallet },
  { href: "/earnings", label: "Earnings", icon: TrendingUp },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
  { href: "/live-tracking", label: "Live Tracking", icon: MapPin },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/promotions", label: "Promotions", icon: Megaphone },
  { href: "/support", label: "Support Tickets", icon: LifeBuoy },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/users-roles", label: "Users & Roles", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-sidebar-bg text-sidebar-text flex flex-col h-screen sticky top-0">
      {/* ---------- Logo header ---------- */}
      <div className="flex items-center gap-2 px-5 py-5">
        <Truck size={22} className="text-primary" />
        <div>
          <p className="text-white font-semibold leading-tight">QuickCarry</p>
          <p className="text-xs text-sidebar-text leading-tight">Admin Panel</p>
        </div>
      </div>

      {/* ---------- Nav links ---------- */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-active text-white font-medium"
                  : "hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ---------- System status card ---------- */}
      <div className="m-3 rounded-xl bg-sidebar-hover p-4 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-white font-medium">All Systems Operational</span>
        </div>
        <div className="space-y-1 text-sidebar-text">
          <div className="flex justify-between">
            <span>Server Uptime</span>
            <span className="text-white">99.9%</span>
          </div>
          <div className="flex justify-between">
            <span>API Status</span>
            <span className="text-primary">Healthy</span>
          </div>
          <div className="flex justify-between">
            <span>Active Sessions</span>
            <span className="text-white">124</span>
          </div>
        </div>
        <button className="mt-3 w-full rounded-lg bg-primary py-2 text-white font-medium hover:bg-primary-dark transition-colors">
          View System Logs
        </button>
      </div>
    </aside>
  );
}
