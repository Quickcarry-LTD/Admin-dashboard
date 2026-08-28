// ===============================================
// File: OrdersOverviewChart.tsx
//
// Purpose:
// The multi-line chart in "Orders Overview" (Total/Completed/
// Pending/Cancelled by day), matching the Figma's 4-line chart.
// ===============================================

"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { mockOrdersOverview } from "@/constants/mockData";

export function OrdersOverviewChart() {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockOrdersOverview}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F2" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#1B7A4C" strokeWidth={2} dot={false} name="Total Orders" />
          <Line type="monotone" dataKey="completed" stroke="#2F80ED" strokeWidth={2} dot={false} name="Completed" />
          <Line type="monotone" dataKey="pending" stroke="#F5A623" strokeWidth={2} dot={false} name="Pending" />
          <Line type="monotone" dataKey="cancelled" stroke="#E0453A" strokeWidth={2} dot={false} name="Cancelled" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
