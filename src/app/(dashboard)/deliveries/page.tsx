"use client";

import { useState } from "react";
import { ArrowDownTrayIcon, TruckIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import ListPanel from "@/components/ListPanel";
import RecordList, { type Field } from "@/components/RecordList";
import { DeliveryBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { humanize, money, relativeTime } from "@/lib/format";
import SearchInput, { FilterChip } from "@/components/SearchInput";
import DateRangePicker from "@/components/DateRangePicker";
import { DELIVERY_STATUSES, type Delivery, type DeliveryStatus } from "@/lib/types";

const LIMIT = 20;

const FIELDS: Field<Delivery>[] = [
  {
    key: "id",
    label: "Delivery",
    // The card headline already says #id and the service/size, so it would
    // only repeat itself here.
    card: false,
    render: (d) => (
      <>
        <span className="tnum font-mono text-base font-semibold text-foreground">#{d.id}</span>
        <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
          {humanize(d.service_type)} · {d.package_size}
        </p>
      </>
    ),
  },
  {
    key: "route",
    label: "Route",
    render: (d) => (
      <>
        <p className="max-w-[220px] truncate text-xs text-secondary-foreground">{d.pickup_address}</p>
        <p className="max-w-[220px] truncate text-sm text-foreground">{d.dropoff_address}</p>
      </>
    ),
  },
  {
    key: "rider",
    label: "Rider",
    cellClassName: "tnum font-mono text-xs text-secondary-foreground",
    render: (d) => (d.rider_id ? `#${d.rider_id}` : "—"),
  },
  {
    key: "distance",
    label: "Distance",
    cellClassName: "tnum text-sm text-secondary-foreground",
    render: (d) => `${d.distance_km.toFixed(1)}km`,
  },
  {
    key: "price",
    label: "Price",
    render: (d) => (
      <>
        <span className="tnum font-mono text-base font-semibold text-foreground">{money(d.price)}</span>
        {d.discount_amount > 0 && (
          <p className="tnum mt-0.5 text-[11px] text-muted-foreground">−{money(d.discount_amount)}</p>
        )}
      </>
    ),
  },
  {
    key: "status",
    label: "Status",
    // Carried by the card badge instead.
    card: false,
    render: (d) => <DeliveryBadge status={d.status} />,
  },
  {
    key: "age",
    label: "Age",
    cellClassName: "text-xs text-secondary-foreground",
    render: (d) => relativeTime(d.created_at),
  },
];

export default function DeliveriesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<DeliveryStatus | "">("");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const { data, error, loading } = useAsync(
    () => api.listDeliveries(page, LIMIT, status, search, range.from, range.to),
    [page, status, search, range.from, range.to],
  );

  const filtered = Boolean(status || search || range.from || range.to);

  function selectStatus(next: DeliveryStatus | "") {
    setStatus(next);
    // A page-3 filter that matches four rows would otherwise land on an
    // empty page — narrowing always returns to the start of the list.
    setPage(1);
  }

  async function handleExport() {
    setExportError("");
    setExporting(true);
    try {
      // Exports whatever filter is on screen, capped server-side at
      // maxExportRows — this is not necessarily every matching row.
      await api.exportDeliveries(status);
    } catch (err) {
      setExportError(errorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Deliveries"
        description="Every job on the platform, newest first. Open one to see its status history or hand it to another rider."
        action={
          <Button variant="ghost" size="sm" onClick={handleExport} disabled={exporting}>
            <ArrowDownTrayIcon className="h-4 w-4" />
            {exporting ? "Exporting" : "Export CSV"}
          </Button>
        }
      />

      <ListPanel
        title="Delivery board"
        loading={loading}
        error={error || exportError}
        isEmpty={items.length === 0}
        emptyIcon={TruckIcon}
        emptyTitle={filtered ? "No deliveries match" : "No deliveries yet"}
        emptyDescription={
          filtered
            ? "Nothing on the board matches that search, status or date range."
            : "Deliveries appear here as customers and merchants book them."
        }
        page={data?.page ?? page}
        limit={data?.limit ?? LIMIT}
        total={data?.total ?? 0}
        onPageChange={setPage}
        toolbar={
          <>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by delivery ID or address"
              className="w-full sm:w-80"
            />
            <DateRangePicker
              from={range.from}
              to={range.to}
              onChange={(next) => {
                setRange(next);
                setPage(1);
              }}
            />
            <div className="flex w-full flex-wrap items-center gap-2">
              <FilterChip active={status === ""} onClick={() => selectStatus("")}>
                All
              </FilterChip>
              {DELIVERY_STATUSES.map((s) => (
                <FilterChip key={s} active={status === s} onClick={() => selectStatus(s)}>
                  {humanize(s)}
                </FilterChip>
              ))}
            </div>
          </>
        }
      >
        <RecordList
          rows={items}
          fields={FIELDS}
          getKey={(d) => String(d.id)}
          minWidth={880}
          href={(d) => `/deliveries/${d.id}`}
          cardTitle={(d) => `#${d.id}`}
          cardSubtitle={(d) => `${humanize(d.service_type)} · ${d.package_size}`}
          cardBadge={(d) => <DeliveryBadge status={d.status} />}
        />
      </ListPanel>
    </>
  );
}
