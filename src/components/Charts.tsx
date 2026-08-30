"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayCount } from "@/lib/types";
import { money, moneyCompact, shortDay } from "@/lib/format";

// Axis and grid resolve to theme tokens so the charts re-theme with the app
// rather than staying dark-on-dark.
const AXIS = { fontSize: 11, fill: "var(--muted-foreground)" } as const;

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string | number;
  format: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-pop">
      <p className="text-sm text-secondary-foreground">{String(label)}</p>
      <p className="tnum mt-0.5 text-base font-semibold text-foreground">
        {format(Number(payload[0]?.value ?? 0))}
      </p>
    </div>
  );
}

/**
 * Deliveries per day. An area rather than bars: seven points of a continuous
 * count read as a trend, and the fill gives the card weight without the
 * heavy chrome bars would add.
 */
export function DeliveriesChart({ data, height = 260 }: { data: DayCount[]; height?: number }) {
  const rows = data.map((d) => ({ ...d, label: shortDay(d.day) }));
  // An area needs two points to have any shape. On a young platform the
  // series is often a single day, which would otherwise render as an empty
  // grid — so below two points the marks are drawn as visible dots.
  const sparse = rows.length < 2;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="deliveriesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} dy={6} />
          <YAxis
            tick={AXIS}
            axisLine={false}
            tickLine={false}
            width={44}
            // Counts have no fractional values, so the axis must not invent
            // any — a 0..1 range would otherwise tick "1, 1, 1, 0, 0".
            allowDecimals={false}
          />
          <Tooltip
            content={<ChartTooltip format={(v) => String(Math.round(v))} />}
            cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#deliveriesFill)"
            dot={sparse ? { r: 4, fill: "var(--chart-1)", strokeWidth: 0 } : false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Revenue per day. Bars, because daily revenue is a set of discrete totals
 * you compare rather than a line you follow. The best day is picked out —
 * with seven bars, "which day won" is the useful question.
 */
export function RevenueChart({ data, height = 260 }: { data: DayCount[]; height?: number }) {
  const rows = data.map((d) => ({ ...d, label: shortDay(d.day) }));
  const peak = Math.max(...rows.map((r) => r.total), 0);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} dy={6} />
          <YAxis
            tick={AXIS}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={moneyCompact}
          />
          <Tooltip content={<ChartTooltip format={money} />} cursor={{ fill: "var(--card-muted)" }} />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive={false}>
            {rows.map((row) => {
              const isPeak = row.total === peak && peak > 0;
              return (
                <Cell
                  key={row.day}
                  fill={isPeak ? "var(--chart-1)" : "var(--chart-2)"}
                  fillOpacity={isPeak ? 1 : 0.35}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Delivery mix as a proportional bar rather than a donut. The API returns a
 * map keyed by status with zero-count statuses absent, so several segments
 * are routinely missing — a bar degrades to "one long block" gracefully,
 * where a donut with two slices looks broken.
 */
export function StatusBar({
  counts,
}: {
  counts: { status: string; total: number; tone: string }[];
}) {
  const total = counts.reduce((sum, c) => sum + c.total, 0);
  if (total === 0) {
    return <p className="text-base text-secondary-foreground">No deliveries recorded yet.</p>;
  }

  const present = counts.filter((c) => c.total > 0);

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-card-muted">
        {present.map((c) => (
          <div
            key={c.status}
            className={c.tone}
            style={{ width: `${(c.total / total) * 100}%` }}
            title={`${c.status}: ${c.total}`}
          />
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {counts.map((c) => (
          <li key={c.status} className="flex items-center gap-3 text-base">
            <span className={`size-2.5 shrink-0 rounded-full ${c.tone}`} aria-hidden />
            <span className="capitalize text-secondary-foreground">{c.status}</span>
            <span className="tnum ml-auto font-medium text-foreground">{c.total}</span>
            <span className="tnum w-10 text-right text-sm text-muted-foreground">
              {Math.round((c.total / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
