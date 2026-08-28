// ===============================================
// File: EarningsOverviewChart.tsx
//
// Purpose:
// The weekly bar chart in "Earnings Overview" on the Dashboard
// page, matching the Figma's green bar chart.
// ===============================================

"use client";

import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import { mockEarningsOverview } from "@/constants/mockData";

export function EarningsOverviewChart() {
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mockEarningsOverview}>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Bar dataKey="amount" fill="#1B7A4C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
