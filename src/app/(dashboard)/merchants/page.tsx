"use client";

import { useState } from "react";
import { BuildingStorefrontIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import ListPanel from "@/components/ListPanel";
import RecordList, { type Field } from "@/components/RecordList";
import { UserStatusBadge, VerificationBadge } from "@/components/StatusBadge";
import { Alert, Spinner } from "@/components/Feedback";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { formatDate, titleCase } from "@/lib/format";
import SearchInput, { FilterChip } from "@/components/SearchInput";
import type { Merchant, VerificationStatus } from "@/lib/types";

const LIMIT = 20;

const FIELDS: Field<Merchant>[] = [
  {
    key: "merchant",
    label: "Merchant",
    card: false,
    render: (m) => (
      <>
        <p className="text-sm font-bold text-foreground">{m.full_name}</p>
        <p className="truncate text-xs text-secondary-foreground">{m.email}</p>
      </>
    ),
  },
  {
    key: "category",
    label: "Trade",
    cellClassName: "text-sm text-secondary-foreground",
    render: (m) => titleCase(m.category),
  },
  {
    key: "pickup",
    label: "Pickup",
    render: (m) => (
      <p className="max-w-[240px] truncate text-sm text-secondary-foreground">{m.pickup_address}</p>
    ),
  },
  {
    // Card-only: the table already carries seven columns plus two action
    // buttons, and phone is not what an operator scans this queue for.
    key: "phone",
    label: "Phone",
    table: false,
    render: (m) => <span className="tnum">{m.phone}</span>,
  },
  {
    key: "account",
    label: "Account",
    render: (m) => <UserStatusBadge status={m.user_status} />,
  },
  {
    key: "verification",
    label: "Verification",
    card: false,
    render: (m) => <VerificationBadge status={m.verification_status} />,
  },
  {
    key: "joined",
    label: "Joined",
    table: false,
    render: (m) => <span className="text-secondary-foreground">{formatDate(m.created_at)}</span>,
  },
];

export default function MerchantsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<VerificationStatus | "">("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const { data, error, loading, reload } = useAsync(
    () => api.listMerchants(page, LIMIT, search, filter),
    [page, search, filter],
  );

  async function verify(m: Merchant, status: VerificationStatus) {
    setActionError("");
    setNotice("");
    setBusyId(m.id);
    try {
      await api.verifyMerchant(m.id, status);
      setNotice(`${m.full_name} marked ${status}.`);
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  const items = data?.items ?? [];
  const awaiting = items.filter((m) => m.verification_status === "pending").length;

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Merchants"
        description="Shops selling through the QuickCarry marketplace. Only approved merchants are visible to customers, so this queue gates whether a shop can trade at all."
      />

      {notice && <Alert tone="success">{notice}</Alert>}
      {actionError && <Alert>{actionError}</Alert>}

      <ListPanel
        title="Merchant accounts"
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyIcon={BuildingStorefrontIcon}
        emptyTitle="No merchants registered"
        emptyDescription="Shops appear here once they register a merchant account."
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
              placeholder="Search by shop, email or phone"
              className="w-full sm:w-80"
            />
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                active={filter === ""}
                onClick={() => {
                  setFilter("");
                  setPage(1);
                }}
              >
                All
              </FilterChip>
              {(["pending", "approved", "rejected"] as VerificationStatus[]).map((v) => (
                <FilterChip
                  key={v}
                  active={filter === v}
                  onClick={() => {
                    setFilter(v);
                    setPage(1);
                  }}
                >
                  {v}
                </FilterChip>
              ))}
            </div>
            <p className="ml-auto text-sm text-secondary-foreground">
              {awaiting} awaiting on this page
            </p>
          </>
        }
      >
        <RecordList
          rows={items}
          fields={FIELDS}
          getKey={(m) => String(m.id)}
          minWidth={860}
          cardTitle={(m) => m.full_name}
          cardSubtitle={(m) => m.email}
          cardBadge={(m) => <VerificationBadge status={m.verification_status} />}
          actions={(m) => (
            <>
              <Button
                size="sm"
                variant="primary"
                disabled={busyId !== null || m.verification_status === "approved"}
                onClick={() => verify(m, "approved")}
              >
                {busyId === m.id && <Spinner />}
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={busyId !== null || m.verification_status === "rejected"}
                onClick={() => verify(m, "rejected")}
              >
                Reject
              </Button>
            </>
          )}
        />
      </ListPanel>
    </>
  );
}
