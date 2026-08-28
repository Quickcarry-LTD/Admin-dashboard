// ===============================================
// File: page.tsx (route: "/riders")
//
// Purpose:
// The Riders management page: a table of every rider with their
// online status, completed orders, rating, and earnings. Maps to
// the "Rider Service" backend module (Onboarding / Documents /
// Online-Offline / Performance).
// ===============================================

import { Search, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { formatCurrency } from "@/utils/formatCurrency";
import { mockAllRiders } from "@/constants/mockData";

export default function RidersPage() {
  return (
    <div>
      <PageHeader
        title="Riders"
        subtitle="Manage rider accounts, verification, and performance."
        action={
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark transition-colors">
            <UserPlus size={15} />
            Add Rider
          </button>
        }
      />

      <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-border bg-surface px-3 py-2 mb-4">
        <Search size={15} className="text-text-tertiary" />
        <input
          type="text"
          placeholder="Search riders..."
          className="flex-1 text-sm outline-none placeholder:text-text-tertiary"
        />
      </div>

      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-secondary">
              <th className="px-5 py-3 font-medium">Rider</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Completed Orders</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {mockAllRiders.map((rider) => (
              <tr key={rider.id} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-xs">
                      {rider.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{rider.name}</p>
                      <p className="text-xs text-text-tertiary">{rider.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-text-secondary">{rider.phone}</td>
                <td className="px-5 py-3">
                  <StatusPill status={rider.status} />
                </td>
                <td className="px-5 py-3">{rider.completedOrders}</td>
                <td className="px-5 py-3">★ {rider.rating}</td>
                <td className="px-5 py-3 font-medium">{formatCurrency(rider.earnings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
