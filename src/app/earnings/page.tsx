// ===============================================
// File: page.tsx (route: "/earnings")
//
// Purpose:
// Platform earnings breakdown (service fees, delivery protection
// fees) distinct from Wallet & Payments (which tracks raw
// transaction volume). Maps to the "Analytics Service" module.
// ===============================================

import { PageHeader } from "@/components/PageHeader";
import { EarningsOverviewChart } from "@/components/charts/EarningsOverviewChart";
import { formatCurrency } from "@/utils/formatCurrency";
import { mockOverviewStats } from "@/constants/mockData";

export default function EarningsPage() {
  return (
    <div>
      <PageHeader title="Earnings" subtitle="Platform revenue breakdown across all delivery fees." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-surface border border-border p-5">
          <p className="text-xs text-text-secondary mb-1">Total Earnings</p>
          <p className="text-2xl font-bold">{formatCurrency(mockOverviewStats.totalEarnings.value)}</p>
          <p className="text-xs text-primary mt-1">↑ {mockOverviewStats.totalEarnings.changePercent}% from last week</p>
        </div>
        <div className="rounded-xl bg-surface border border-border p-5">
          <p className="text-xs text-text-secondary mb-1">Service Fees</p>
          <p className="text-2xl font-bold">{formatCurrency(mockOverviewStats.totalEarnings.value * 0.06)}</p>
        </div>
        <div className="rounded-xl bg-surface border border-border p-5">
          <p className="text-xs text-text-secondary mb-1">Delivery Protection Fees</p>
          <p className="text-2xl font-bold">{formatCurrency(mockOverviewStats.totalEarnings.value * 0.09)}</p>
        </div>
      </div>

      <div className="rounded-xl bg-surface border border-border p-5">
        <h2 className="text-sm font-semibold mb-4">Weekly Earnings</h2>
        <EarningsOverviewChart />
      </div>
    </div>
  );
}
