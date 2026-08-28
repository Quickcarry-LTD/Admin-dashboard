// ===============================================
// File: page.tsx (route: "/orders")
//
// Purpose:
// The Orders management page: a full table of all orders with
// status pills, search/filter controls, and per-row actions.
// Maps to the "Delivery Service" and "Dispatch Engine" backend
// modules (order records, status, assignment).
//
// Responsibilities:
// - List every order in a sortable, filterable table
// - Show route, status, amount, and time for each order
// ===============================================

import { Search, Filter, Download, Eye } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { formatCurrency } from "@/utils/formatCurrency";
import { mockAllOrders } from "@/constants/mockData";

export default function OrdersPage() {
  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="View and manage every delivery order on the platform."
        action={
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark transition-colors">
            <Download size={15} />
            Export
          </button>
        }
      />

      {/* ---------- Search + filter bar ---------- */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-border bg-surface px-3 py-2">
          <Search size={15} className="text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by order ID or route..."
            className="flex-1 text-sm outline-none placeholder:text-text-tertiary"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm">
          <Filter size={15} />
          Filter
        </button>
      </div>

      {/* ---------- Orders table ---------- */}
      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-secondary">
              <th className="px-5 py-3 font-medium">Order ID</th>
              <th className="px-5 py-3 font-medium">Route</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAllOrders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-5 py-3 font-medium">{order.id}</td>
                <td className="px-5 py-3 text-text-secondary">{order.route}</td>
                <td className="px-5 py-3">
                  <StatusPill status={order.status} />
                </td>
                <td className="px-5 py-3 font-medium">{formatCurrency(order.amount)}</td>
                <td className="px-5 py-3 text-text-tertiary">{order.time}</td>
                <td className="px-5 py-3 text-right">
                  <button className="inline-flex items-center gap-1 text-primary text-xs font-medium">
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
