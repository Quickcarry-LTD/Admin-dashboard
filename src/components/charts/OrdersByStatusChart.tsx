// ===============================================
// File: OrdersByStatusChart.tsx
//
// Purpose:
// The donut chart in "Orders by Status" with a centered total
// count and a status legend below, matching the Figma.
// ===============================================

"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { mockOrdersByStatus } from "@/constants/mockData";

export function OrdersByStatusChart() {
  const total = mockOrdersByStatus.reduce((sum, s) => sum + s.value, 0);

  return (
    <div>
      <div className="h-44 w-44 mx-auto relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={mockOrdersByStatus}
              dataKey="value"
              nameKey="status"
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={50}
              outerRadius={78}
              paddingAngle={2}
            >
              {mockOrdersByStatus.map((entry) => (
                <Cell key={entry.status} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Centered total, overlaid on the donut hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold">{total.toLocaleString()}</span>
          <span className="text-[10px] text-text-tertiary">Total</span>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {mockOrdersByStatus.map((s) => (
          <div key={s.status} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-text-secondary">{s.status}</span>
            </div>
            <span className="font-medium">
              {s.value} ({s.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
