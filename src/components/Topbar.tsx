// ===============================================
// File: Topbar.tsx
//
// Purpose:
// The header bar above every page's content, matching the Figma:
// a global search input, message/notification icon buttons, and
// the signed-in admin's avatar + name + role.
// ===============================================

"use client";

import { Search, Bell, Mail, Menu, ChevronDown } from "lucide-react";
import { mockAdmin } from "@/constants/mockData";

export function Topbar() {
  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 gap-4">
      {/* ---------- Search ---------- */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button className="lg:hidden">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 flex-1 rounded-lg border border-border px-3 py-2">
          <Search size={16} className="text-text-tertiary" />
          <input
            type="text"
            placeholder="Search orders, riders, customers..."
            className="flex-1 text-sm outline-none placeholder:text-text-tertiary"
          />
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell size={19} className="text-foreground" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger text-[10px] text-white flex items-center justify-center">
            3
          </span>
        </button>
        <button>
          <Mail size={19} className="text-foreground" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="h-9 w-9 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-sm">
            {mockAdmin.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{mockAdmin.name}</p>
            <p className="text-xs text-text-secondary leading-tight">{mockAdmin.role}</p>
          </div>
          <ChevronDown size={16} className="text-text-tertiary" />
        </div>
      </div>
    </header>
  );
}
