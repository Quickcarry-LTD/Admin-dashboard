"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Panel, { PageHeader } from "@/components/Panel";
import DateRangePicker, { presetRange, type DateRange } from "@/components/DateRangePicker";
import StatCard from "@/components/StatCard";
import { ButtonLink } from "@/components/Button";
import { DeliveriesChart, RevenueChart, StatusBar } from "@/components/Charts";
import { DeliveryBadge } from "@/components/StatusBadge";
import {
  Alert,
  ChartSkeleton,
  EmptyState,
  RowSkeleton,
  StatCardSkeleton,
} from "@/components/Feedback";
import { api } from "@/lib/api";
import { useState } from "react";
import { useAsync } from "@/lib/useAsync";
import { count, money, relativeTime } from "@/lib/format";
import {
  ACTIVE_DELIVERY_STATUSES,
  DELIVERY_STATUSES,
  type DeliveryStatus,
} from "@/lib/types";

// Mix-bar tones mirror DeliveryBadge's, so a status is the same colour in the
// chart as it is on every row of the deliveries table.
const STATUS_TONES: Record<DeliveryStatus, string> = {
  pending: "bg-neutral",
  searching: "bg-warning",
  accepted: "bg-primary",
  picked_up: "bg-primary",
  in_transit: "bg-info",
  delivered: "bg-success",
  cancelled: "bg-danger",
};

export default function DashboardPage() {
  // The window every trend on this page describes. Defaults to the last seven
  // days so the first paint matches what the old fixed endpoint returned.
  const [range, setRange] = useState<DateRange>(() => presetRange(7));

  const summary = useAsync(() => api.reportsSummary(), []);
  const analytics = useAsync(
    () => api.analyticsRange(range.from, range.to),
    [range.from, range.to],
  );
  const float = useAsync(() => api.walletFloat(), []);
  const recent = useAsync(() => api.listDeliveries(1, 6), []);
  const openComplaints = useAsync(() => api.listComplaints(1, 1, "open"), []);
  const withdrawals = useAsync(() => api.listWithdrawals(1, 100), []);
  const merchants = useAsync(() => api.listMerchants(1, 100), []);
  const riders = useAsync(() => api.listRiders(1, 100), []);

  const byStatus = summary.data?.deliveries_by_status ?? {};
  const totalDeliveries = Object.values(byStatus).reduce((s, n) => s + (n ?? 0), 0);
  const active = ACTIVE_DELIVERY_STATUSES.reduce((s, k) => s + (byStatus[k] ?? 0), 0);
  const delivered = byStatus.delivered ?? 0;
  const cancelled = byStatus.cancelled ?? 0;

  // Completion rate over terminal deliveries only — counting in-flight jobs
  // as "not completed" would make a busy day look like a failing one.
  const terminal = delivered + cancelled;
  const completionRate = terminal > 0 ? (delivered / terminal) * 100 : null;

  // These three have no aggregate endpoint, so they are derived from the
  // first page of each list and labelled as such where it matters.
  const pendingPayouts =
    withdrawals.data?.items.filter((w) => w.status === "pending").length ?? 0;
  const merchantsAwaiting =
    merchants.data?.items.filter((m) => m.verification_status === "pending").length ?? 0;
  const ridersAwaiting =
    riders.data?.items.filter((r) => r.verification_status === "pending").length ?? 0;
  const ridersOnline = riders.data?.items.filter((r) => r.is_online).length ?? 0;

  const queues = [
    {
      href: "/complaints",
      icon: ChatBubbleLeftRightIcon,
      label: "Open complaints",
      value: openComplaints.data?.total ?? 0,
      loading: openComplaints.loading,
    },
    {
      href: "/withdrawals",
      icon: BanknotesIcon,
      label: "Withdrawals to pay out",
      value: pendingPayouts,
      loading: withdrawals.loading,
    },
    {
      href: "/merchants",
      icon: BuildingStorefrontIcon,
      label: "Merchants to verify",
      value: merchantsAwaiting,
      loading: merchants.loading,
    },
    {
      href: "/riders",
      icon: ShieldCheckIcon,
      label: "Riders to verify",
      value: ridersAwaiting,
      loading: riders.loading,
    },
  ];

  const error = summary.error || analytics.error;

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Live platform totals, volume and revenue over the window you pick, and everything currently waiting on a decision."
        action={
          <ButtonLink href="/deliveries" variant="outline" size="sm">
            Open delivery board
            <ArrowRightIcon />
          </ButtonLink>
        }
      />

      {error && <Alert>{error}</Alert>}

      <DateRangePicker
        from={range.from}
        to={range.to}
        onChange={setRange}
        className="rounded-xl border border-border bg-card px-4 py-3 shadow-card"
      />

      {/* ---------- KPI row ---------- */}
      <section aria-label="Key metrics" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summary.loading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Revenue"
              value={money(summary.data?.total_delivered_revenue ?? 0)}
              sub="Delivered, all time"
              icon={CreditCardIcon}
              tone="success"
            />
            <StatCard
              label="Deliveries"
              value={count(totalDeliveries)}
              sub={`${count(active)} active right now`}
              icon={TruckIcon}
              tone="brand"
            />
            <StatCard
              label="Riders"
              value={count(summary.data?.total_riders ?? 0)}
              sub={`${count(ridersOnline)} online`}
              icon={UsersIcon}
              tone="info"
            />
            <StatCard
              label="Customers"
              value={count(summary.data?.total_customers ?? 0)}
              sub="Registered accounts"
              icon={UserGroupIcon}
              tone="neutral"
            />
            {/* Wallet float is a liability, not income: it is what the
                platform owes riders, customers and shops right now, and it is
                the number that decides whether a payout run is safe. */}
            <StatCard
              label="Wallet float"
              value={float.loading ? "—" : money(float.data?.total_balance ?? 0)}
              sub={
                float.data
                  ? `${money(float.data.rider_balance)} owed to riders`
                  : "Held on behalf of users"
              }
              icon={ScaleIcon}
              tone="warning"
              href="/withdrawals"
            />
          </>
        )}
      </section>

      {/* ---------- Action queues ----------
          Everything on this row is something only an admin can clear, so it
          sits above the charts: the dashboard's first job is to say what
          needs doing, not what happened. */}
      <section aria-label="Waiting on you" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {queues.map((q) => (
          <StatCard
            key={q.href}
            href={q.href}
            icon={q.icon}
            label={q.label}
            value={q.loading ? "—" : count(q.value)}
            sub={q.value > 0 ? "Needs attention" : "All clear"}
            tone={q.value > 0 ? "warning" : "neutral"}
            alert={q.value > 0}
          />
        ))}
      </section>

      {/* ---------- Trends ---------- */}
      <section className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Deliveries"
          action={<RangeLabel from={analytics.data?.from} to={analytics.data?.to} />}
        >
          {analytics.loading ? (
            <ChartSkeleton />
          ) : (
            <DeliveriesChart data={analytics.data?.deliveries_per_day ?? []} />
          )}
        </Panel>
        <Panel
          title="Revenue"
          action={<RangeLabel from={analytics.data?.from} to={analytics.data?.to} />}
        >
          {analytics.loading ? (
            <ChartSkeleton />
          ) : (
            <RevenueChart data={analytics.data?.revenue_per_day ?? []} />
          )}
        </Panel>
      </section>

      {/* ---------- Mix + recent ---------- */}
      <section className="grid gap-5 lg:grid-cols-5">
        <Panel title="Delivery mix" className="lg:col-span-2">
          {summary.loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <RowSkeleton key={i} labelWidth="w-20" valueWidth="w-12" />
              ))}
            </div>
          ) : (
            <>
              {completionRate !== null && (
                <div className="mb-5 rounded-xl bg-card-muted px-4 py-3">
                  <p className="text-sm text-secondary-foreground">Completion rate</p>
                  <p className="tnum mt-1 text-2xl font-bold tracking-tight text-foreground">
                    {completionRate.toFixed(1)}%
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {count(delivered)} delivered of {count(terminal)} finished
                  </p>
                </div>
              )}
              <StatusBar
                counts={DELIVERY_STATUSES.map((status) => ({
                  status: status.replace(/_/g, " "),
                  total: byStatus[status] ?? 0,
                  tone: STATUS_TONES[status],
                }))}
              />
            </>
          )}
        </Panel>

        <Panel
          title="Latest deliveries"
          className="lg:col-span-3"
          bodyClassName=""
          action={
            <Link
              href="/deliveries"
              className="inline-flex items-center gap-1 text-base font-medium text-primary-accent hover:underline"
            >
              View all
              <ArrowRightIcon className="size-3.5" />
            </Link>
          }
        >
          {recent.error ? (
            <div className="p-5">
              <Alert>{recent.error}</Alert>
            </div>
          ) : recent.loading ? (
            <div className="divide-y divide-border px-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <RowSkeleton key={i} labelWidth="w-40" valueWidth="w-24" />
              ))}
            </div>
          ) : recent.data?.items.length === 0 ? (
            <EmptyState
              icon={TruckIcon}
              title="No deliveries yet"
              description="Jobs appear here as customers and merchants book them."
            />
          ) : (
            <ul className="divide-y divide-border">
              {recent.data?.items.map((d) => (
                <li key={d.id} className="transition-colors hover:bg-card-muted">
                  <Link
                    href={`/deliveries/${d.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="tnum text-base font-medium text-foreground">#{d.id}</p>
                      <p className="mt-0.5 truncate text-sm text-secondary-foreground">
                        {d.dropoff_address}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="tnum hidden text-base font-medium text-foreground sm:block">
                        {money(d.price)}
                      </span>
                      <DeliveryBadge status={d.status} />
                      <span className="hidden w-16 text-right text-sm text-muted-foreground md:block">
                        {relativeTime(d.created_at)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </>
  );
}

/** Says which window the panel beside it is describing. */
function RangeLabel({ from, to }: { from?: string; to?: string }) {
  if (!from || !to) return <span className="text-sm text-secondary-foreground">—</span>;
  return (
    <span className="tnum text-sm text-secondary-foreground">
      {from} to {to}
    </span>
  );
}
