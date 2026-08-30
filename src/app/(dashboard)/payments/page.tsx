"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownTrayIcon, CreditCardIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import StatCard from "@/components/StatCard";
import ListPanel from "@/components/ListPanel";
import RecordList, { type Field } from "@/components/RecordList";
import { PaymentBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { money, relativeTime } from "@/lib/format";
import type { Payment } from "@/lib/types";

const LIMIT = 20;

const FIELDS: Field<Payment>[] = [
  {
    key: "id",
    label: "Payment",
    card: false,
    render: (p) => (
      <>
        <span className="tnum font-mono text-base font-semibold text-foreground">#{p.id}</span>
        {p.transaction_ref && (
          <p className="mt-0.5 max-w-[140px] truncate text-[11px] text-muted-foreground">
            {p.transaction_ref}
          </p>
        )}
      </>
    ),
  },
  {
    key: "delivery",
    label: "Delivery",
    render: (p) => (
      <Link
        href={`/deliveries/${p.delivery_id}`}
        className="tnum font-mono text-xs text-foreground underline decoration-primary decoration-2 underline-offset-2"
      >
        #{p.delivery_id}
      </Link>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    cellClassName: "tnum font-mono text-base font-semibold text-foreground",
    render: (p) => money(p.amount),
  },
  {
    key: "commission",
    label: "Commission",
    cellClassName: "tnum text-sm text-secondary-foreground",
    render: (p) => money(p.commission_amount),
  },
  {
    key: "payout",
    label: "Rider payout",
    cellClassName: "tnum text-sm text-secondary-foreground",
    render: (p) => money(p.rider_payout),
  },
  {
    key: "method",
    label: "Method",
    cellClassName: "text-sm text-secondary-foreground",
    render: (p) => p.method,
  },
  {
    key: "status",
    label: "Status",
    card: false,
    render: (p) => <PaymentBadge status={p.status} />,
  },
  {
    key: "when",
    label: "When",
    cellClassName: "text-xs text-secondary-foreground",
    render: (p) => relativeTime(p.created_at),
  },
];

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const { data, error, loading } = useAsync(() => api.listPayments(page, LIMIT), [page]);

  async function handleExport() {
    setExportError("");
    setExporting(true);
    try {
      await api.exportPayments();
    } catch (err) {
      setExportError(errorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  const items = data?.items ?? [];

  // Page totals, not platform totals — there is no aggregate payments
  // endpoint, so these are labelled as covering the rows on screen.
  const pageGross = items.reduce((sum, p) => sum + p.amount, 0);
  const pageCommission = items.reduce((sum, p) => sum + p.commission_amount, 0);
  const pagePayout = items.reduce((sum, p) => sum + p.rider_payout, 0);

  return (
    <>
      <PageHeader
        eyebrow="Money"
        title="Payments"
        description="Every fare collected, split into what QuickCarry keeps and what the rider is owed."
        action={
          <Button variant="ghost" size="sm" onClick={handleExport} disabled={exporting}>
            <ArrowDownTrayIcon className="h-4 w-4" />
            {exporting ? "Exporting" : "Export CSV"}
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Gross · this page" value={money(pageGross)} icon={CreditCardIcon} />
        <StatCard
          label="Commission · this page"
          value={money(pageCommission)}
          icon={CreditCardIcon}
          tone="success"
        />
        <StatCard
          label="Rider payout · this page"
          value={money(pagePayout)}
          icon={CreditCardIcon}
          tone="info"
        />
      </div>

      <ListPanel
        title="Payment ledger"
        loading={loading}
        error={error || exportError}
        isEmpty={items.length === 0}
        emptyIcon={CreditCardIcon}
        emptyTitle="No payments recorded"
        emptyDescription="Payments are written when a delivery is paid for."
        page={data?.page ?? page}
        limit={data?.limit ?? LIMIT}
        total={data?.total ?? 0}
        onPageChange={setPage}
      >
        <RecordList
          rows={items}
          fields={FIELDS}
          getKey={(p) => String(p.id)}
          minWidth={920}
          cardTitle={(p) => `#${p.id}`}
          cardSubtitle={(p) => p.transaction_ref ?? relativeTime(p.created_at)}
          cardBadge={(p) => <PaymentBadge status={p.status} />}
        />
      </ListPanel>
    </>
  );
}
