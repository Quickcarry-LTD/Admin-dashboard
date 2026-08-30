"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/Panel";
import StatCard from "@/components/StatCard";
import ListPanel from "@/components/ListPanel";
import RecordList, { type Field } from "@/components/RecordList";
import { Badge, type Tone } from "@/components/StatusBadge";
import SearchInput, { FilterChip } from "@/components/SearchInput";
import { Alert, StatCardSkeleton } from "@/components/Feedback";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { count, money, relativeTime } from "@/lib/format";
import { ORDER_STATUSES, type MarketplaceOrder, type OrderStatus } from "@/lib/types";

const LIMIT = 20;

// The marketplace order lifecycle is the merchant's, not the rider's: a shop
// accepts, prepares and marks ready, then the delivery takes over.
const ORDER_TONES: Record<OrderStatus, Tone> = {
  pending: "warning",
  accepted: "progress",
  preparing: "progress",
  ready: "info",
  completed: "success",
  rejected: "danger",
  cancelled: "danger",
};

const FIELDS: Field<MarketplaceOrder>[] = [
  {
    key: "id",
    label: "Order",
    card: false,
    render: (o) => <span className="tnum font-medium text-foreground">#{o.id}</span>,
  },
  {
    key: "merchant",
    label: "Merchant",
    render: (o) => (
      <Link
        href={`/merchants?search=${encodeURIComponent(o.merchant_name)}`}
        className="text-primary-accent hover:underline"
      >
        {o.merchant_name}
      </Link>
    ),
  },
  {
    key: "customer",
    label: "Customer",
    cellClassName: "text-secondary-foreground",
    render: (o) => o.customer_name,
  },
  {
    key: "items",
    label: "Goods",
    align: "right",
    cellClassName: "tnum text-secondary-foreground",
    render: (o) => money(o.items_total),
  },
  {
    key: "delivery",
    label: "Delivery",
    align: "right",
    cellClassName: "tnum text-secondary-foreground",
    render: (o) => money(o.delivery_fee),
  },
  {
    key: "total",
    label: "Total",
    align: "right",
    cellClassName: "tnum font-medium text-foreground",
    render: (o) => money(o.total),
  },
  {
    key: "status",
    label: "Status",
    card: false,
    render: (o) => <Badge tone={ORDER_TONES[o.status] ?? "neutral"}>{o.status}</Badge>,
  },
  {
    key: "when",
    label: "Placed",
    cellClassName: "text-secondary-foreground",
    render: (o) => relativeTime(o.created_at),
  },
];

export default function MarketplacePage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");

  const summary = useAsync(() => api.marketplaceSummary(), []);
  const { data, error, loading } = useAsync(
    () => api.listMarketplaceOrders(page, LIMIT, status, search),
    [page, status, search],
  );

  const items = data?.items ?? [];
  const filtered = Boolean(status || search);
  const s = summary.data;

  return (
    <>
      <PageHeader
        eyebrow="Commerce"
        title="Marketplace"
        description="Orders placed with merchants through the QuickCarry shop. GMV counts completed orders only — a pending basket is not revenue."
      />

      {summary.error && <Alert>{summary.error}</Alert>}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {summary.loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="GMV"
              value={money(s?.gmv ?? 0)}
              sub="Completed orders"
              icon={ShoppingBagIcon}
              tone="success"
            />
            <StatCard
              label="Goods value"
              value={money(s?.items_total ?? 0)}
              sub="Excluding delivery"
              icon={BuildingStorefrontIcon}
              tone="brand"
            />
            <StatCard
              label="Delivery fees"
              value={money(s?.delivery_fees ?? 0)}
              sub="On completed orders"
              icon={TruckIcon}
              tone="info"
            />
            <StatCard
              label="Orders"
              value={count(s?.total_orders ?? 0)}
              sub={`${count(s?.completed_orders ?? 0)} completed`}
              icon={ShoppingBagIcon}
              tone="neutral"
            />
          </>
        )}
      </section>

      <ListPanel
        title="Orders"
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyIcon={ShoppingBagIcon}
        emptyTitle={filtered ? "No orders match" : "No marketplace orders yet"}
        emptyDescription={
          filtered
            ? "Nothing matches that search or status filter."
            : "Orders appear here once customers buy from a merchant."
        }
        page={data?.page ?? page}
        limit={data?.limit ?? LIMIT}
        total={data?.total ?? 0}
        onPageChange={setPage}
        skeletonColumns={6}
        toolbar={
          <>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by order ID, merchant or customer"
              className="w-full sm:w-96"
            />
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                active={status === ""}
                onClick={() => {
                  setStatus("");
                  setPage(1);
                }}
              >
                All
              </FilterChip>
              {ORDER_STATUSES.map((st) => (
                <FilterChip
                  key={st}
                  active={status === st}
                  onClick={() => {
                    setStatus(st);
                    setPage(1);
                  }}
                >
                  {st}
                </FilterChip>
              ))}
            </div>
          </>
        }
      >
        <RecordList
          rows={items}
          fields={FIELDS}
          getKey={(o) => String(o.id)}
          minWidth={1000}
          cardTitle={(o) => `#${o.id} · ${o.merchant_name}`}
          cardSubtitle={(o) => o.customer_name}
          cardBadge={(o) => <Badge tone={ORDER_TONES[o.status] ?? "neutral"}>{o.status}</Badge>}
        />
      </ListPanel>
    </>
  );
}
