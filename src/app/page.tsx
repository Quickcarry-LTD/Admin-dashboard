// ===============================================
// File: page.tsx (Dashboard route: "/")
//
// Purpose:
// The Admin Dashboard's landing page. Matches the Figma "Dashboard
// Overview" screen exactly: 5 stat cards, an Orders Overview line
// chart, an Orders by Status donut chart, a Live Tracking map
// preview, Recent Orders, Top Performing Riders, Recent Customers,
// an Earnings Overview bar chart, and a Quick Actions grid.
//
// Responsibilities:
// - Render every section of the overview using the mock data in
//   src/constants/mockData.ts (swap for real API calls once the
//   Admin Service / Analytics Service endpoints are available)
// ===============================================

import {
  ClipboardList,
  CheckCircle2,
  Users,
  UserCog,
  Wallet,
  Download,
  PlusCircle,
  UserPlus,
  Send,
  FileText,
  Settings,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { OrdersOverviewChart } from "@/components/charts/OrdersOverviewChart";
import { OrdersByStatusChart } from "@/components/charts/OrdersByStatusChart";
import { EarningsOverviewChart } from "@/components/charts/EarningsOverviewChart";
import { StatusPill } from "@/components/StatusPill";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  mockOverviewStats,
  mockRecentOrders,
  mockTopRiders,
  mockRecentCustomers,
} from "@/constants/mockData";

// Sparkline data is illustrative until the Analytics Service
// provides real historical series per metric.
const SPARK = {
  orders: [40, 55, 48, 62, 58, 70, 65],
  completed: [30, 40, 45, 50, 55, 60, 62],
  riders: [10, 12, 14, 13, 15, 16, 18],
  customers: [20, 25, 28, 30, 35, 40, 42],
  earnings: [15, 20, 18, 25, 30, 28, 35],
};

export default function DashboardPage() {
  return (
    <div>
      {/* ---------- Page header ---------- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Dashboard Overview</h1>
          <p className="text-sm text-text-secondary mt-1">
            Welcome back, Admin! Here&apos;s what&apos;s happening with QuickCarry today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-border bg-surface px-4 py-2 text-sm">
            May 12 – May 18, 2025
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark transition-colors">
            <Download size={15} />
            Export Report
          </button>
        </div>
      </div>

      {/* ---------- Stat cards ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={<ClipboardList size={16} color="#1B7A4C" />}
          iconBg="#E8F5EE"
          label="Total Orders"
          value={mockOverviewStats.totalOrders.value.toLocaleString()}
          changePercent={mockOverviewStats.totalOrders.changePercent}
          sparklineColor="#1B7A4C"
          sparklineData={SPARK.orders}
        />
        <StatCard
          icon={<CheckCircle2 size={16} color="#F5A623" />}
          iconBg="#FEF3E2"
          label="Completed Orders"
          value={mockOverviewStats.completedOrders.value.toLocaleString()}
          changePercent={mockOverviewStats.completedOrders.changePercent}
          sparklineColor="#F5A623"
          sparklineData={SPARK.completed}
        />
        <StatCard
          icon={<Users size={16} color="#2F80ED" />}
          iconBg="#EAF2FE"
          label="Active Riders"
          value={mockOverviewStats.activeRiders.value.toLocaleString()}
          changePercent={mockOverviewStats.activeRiders.changePercent}
          sparklineColor="#2F80ED"
          sparklineData={SPARK.riders}
        />
        <StatCard
          icon={<UserCog size={16} color="#8B5CF6" />}
          iconBg="#F0EBFE"
          label="Total Customers"
          value={mockOverviewStats.totalCustomers.value.toLocaleString()}
          changePercent={mockOverviewStats.totalCustomers.changePercent}
          sparklineColor="#8B5CF6"
          sparklineData={SPARK.customers}
        />
        <StatCard
          icon={<Wallet size={16} color="#1B7A4C" />}
          iconBg="#E8F5EE"
          label="Total Earnings"
          value={formatCurrency(mockOverviewStats.totalEarnings.value)}
          changePercent={mockOverviewStats.totalEarnings.changePercent}
          sparklineColor="#1B7A4C"
          sparklineData={SPARK.earnings}
        />
      </div>

      {/* ---------- Orders Overview + Orders by Status + Live Tracking + Recent Orders ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <div className="lg:col-span-1 rounded-xl bg-surface border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Orders Overview</h2>
            <span className="text-xs text-text-secondary">This Week</span>
          </div>
          <OrdersOverviewChart />
        </div>

        <div className="lg:col-span-1 rounded-xl bg-surface border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Orders by Status</h2>
          <OrdersByStatusChart />
        </div>

        <div className="lg:col-span-1 rounded-xl bg-surface border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Live Tracking</h2>
            <a href="/live-tracking" className="text-xs text-primary">View All</a>
          </div>
          <div className="h-32 rounded-lg bg-primary-light flex items-center justify-center text-xs text-text-secondary">
            Map preview — see Live Tracking page
          </div>
        </div>

        <div className="lg:col-span-1 rounded-xl bg-surface border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Orders</h2>
            <a href="/orders" className="text-xs text-primary">View All</a>
          </div>
          <div className="space-y-3">
            {mockRecentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <StatusPill status={order.status} />
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.amount)}</p>
                  <p className="text-text-tertiary">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Top Riders + Recent Customers + Earnings Overview ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="rounded-xl bg-surface border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Top Performing Riders</h2>
            <a href="/riders" className="text-xs text-primary">View All</a>
          </div>
          <div className="space-y-3">
            {mockTopRiders.map((rider) => (
              <div key={rider.name} className="flex items-center gap-3 text-xs">
                <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold shrink-0">
                  {rider.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{rider.name}</p>
                  <p className="text-text-tertiary">{rider.completedOrders} orders</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium">{formatCurrency(rider.earnings)}</p>
                  <p className="text-primary">{rider.completionRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-surface border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Customers</h2>
            <a href="/customers" className="text-xs text-primary">View All</a>
          </div>
          <div className="space-y-3">
            {mockRecentCustomers.map((c) => (
              <div key={c.email} className="flex items-center gap-3 text-xs">
                <div className="h-8 w-8 rounded-full bg-info-soft flex items-center justify-center text-info font-semibold shrink-0">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-text-tertiary truncate">{c.email}</p>
                </div>
                <p className="text-text-tertiary shrink-0">{c.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-surface border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Earnings Overview</h2>
            <span className="text-xs text-text-secondary">This Week</span>
          </div>
          <p className="text-lg font-bold mb-1">
            {formatCurrency(mockOverviewStats.totalEarnings.value)}
          </p>
          <p className="text-xs text-primary mb-3">
            ↑ {mockOverviewStats.totalEarnings.changePercent}% from last week
          </p>
          <EarningsOverviewChart />
        </div>
      </div>

      {/* ---------- Quick Actions ---------- */}
      <div className="rounded-xl bg-surface border border-border p-5">
        <h2 className="text-sm font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <QuickActionButton icon={PlusCircle} label="Create Order" />
          <QuickActionButton icon={UserPlus} label="Add Rider" />
          <QuickActionButton icon={UserCog} label="Add User" />
          <QuickActionButton icon={Send} label="Send Notification" />
          <QuickActionButton icon={FileText} label="Generate Report" />
          <QuickActionButton icon={Settings} label="System Settings" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <button className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:bg-primary-light transition-colors">
      <Icon size={18} className="text-primary" />
      <span className="text-xs text-center">{label}</span>
    </button>
  );
}
