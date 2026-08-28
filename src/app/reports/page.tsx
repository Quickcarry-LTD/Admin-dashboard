// ===============================================
// File: page.tsx (route: "/reports")
//
// Purpose:
// Deeper analytics view: full Orders Overview chart, Orders by
// Status breakdown, and a report export action. Maps to the
// "Analytics Service" backend module (Reports / Business Metrics /
// Rider Analytics / Revenue Insights).
// ===============================================

import { Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { OrdersOverviewChart } from "@/components/charts/OrdersOverviewChart";
import { OrdersByStatusChart } from "@/components/charts/OrdersByStatusChart";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Deep-dive into order trends, rider performance, and revenue."
        action={
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark transition-colors">
            <Download size={15} />
            Export Report
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl bg-surface border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Orders Trend</h2>
          <OrdersOverviewChart />
        </div>
        <div className="rounded-xl bg-surface border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Orders by Status</h2>
          <OrdersByStatusChart />
        </div>
      </div>
    </div>
  );
}
