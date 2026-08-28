// ===============================================
// File: StatCard.tsx
//
// Purpose:
// One of the 5 overview metric cards on the Dashboard page
// (Total Orders, Completed Orders, Active Riders, Total Customers,
// Total Earnings), each with an icon, big number, % change label,
// and a small sparkline chart underneath.
// ===============================================

"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  changePercent: number;
  sparklineColor: string;
  sparklineData: number[];
}

export function StatCard({
  icon,
  iconBg,
  label,
  value,
  changePercent,
  sparklineColor,
  sparklineData,
}: StatCardProps) {
  const chartData = sparklineData.map((v, i) => ({ i, v }));

  return (
    <div className="rounded-xl bg-surface border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
      </div>
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-primary mt-1">
        ↑ {changePercent}% from last week
      </p>
      <div className="h-10 mt-2 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={sparklineColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
