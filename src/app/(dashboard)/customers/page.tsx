"use client";

import { useState } from "react";
import { UserGroupIcon } from "@heroicons/react/24/solid";
import SearchInput from "@/components/SearchInput";
import { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import ListPanel from "@/components/ListPanel";
import RecordList, { type Field } from "@/components/RecordList";
import { UserStatusBadge } from "@/components/StatusBadge";
import { Alert, Spinner } from "@/components/Feedback";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { formatDate } from "@/lib/format";
import type { AdminCustomer } from "@/lib/types";

const LIMIT = 20;

// The admin customers endpoint returns userView — six fields, no order
// counts and no ratings summary — so those columns cannot be shown here
// without a request per row. The detail page fetches ratings separately.
const FIELDS: Field<AdminCustomer>[] = [
  {
    key: "customer",
    label: "Customer",
    card: false,
    render: (c) => (
      <>
        <p className="text-sm font-bold text-foreground">{c.full_name}</p>
        <p className="truncate text-xs text-secondary-foreground">{c.email}</p>
      </>
    ),
  },
  {
    key: "phone",
    label: "Phone",
    cellClassName: "tnum text-sm text-secondary-foreground",
    render: (c) => c.phone,
  },
  {
    key: "joined",
    label: "Joined",
    cellClassName: "text-xs text-secondary-foreground",
    render: (c) => formatDate(c.created_at),
  },
  {
    key: "status",
    label: "Status",
    card: false,
    render: (c) => <UserStatusBadge status={c.status} />,
  },
];

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  const { data, error, loading, reload } = useAsync(
    () => api.listCustomers(page, LIMIT, search),
    [page, search],
  );

  // Narrowing always returns to page 1: a page-3 query matching four rows
  // would otherwise land on an empty page.
  function applySearch(next: string) {
    setSearch(next);
    setPage(1);
  }

  async function toggleStatus(id: number, current: string) {
    setActionError("");
    setBusyId(id);
    try {
      await api.setCustomerStatus(id, current === "suspended" ? "active" : "suspended");
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Customers"
        description="Everyone who books on QuickCarry. Suspending an account blocks new bookings immediately."
      />

      {actionError && <Alert>{actionError}</Alert>}

      <ListPanel
        title="Customers"
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyIcon={UserGroupIcon}
        page={data?.page ?? page}
        limit={data?.limit ?? LIMIT}
        total={data?.total ?? 0}
        onPageChange={setPage}
        toolbar={
          <SearchInput
            value={search}
            onChange={applySearch}
            placeholder="Search by name, email or phone"
            className="w-full sm:w-80"
          />
        }
        emptyTitle={search ? "No customers match" : "No customers yet"}
        emptyDescription={
          search
            ? "Nothing matches that search. Try a partial name, email or phone number."
            : "Customer accounts appear here as people register."
        }
      >
        <RecordList
          rows={items}
          fields={FIELDS}
          getKey={(c) => String(c.id)}
          minWidth={760}
          href={(c) => `/customers/${c.id}`}
          cardTitle={(c) => c.full_name}
          cardSubtitle={(c) => c.email}
          cardBadge={(c) => <UserStatusBadge status={c.status} />}
          actions={(c) => (
            <Button
              size="sm"
              variant={c.status === "suspended" ? "primary" : "danger"}
              disabled={busyId !== null}
              onClick={() => toggleStatus(c.id, c.status)}
            >
              {busyId === c.id && <Spinner />}
              {c.status === "suspended" ? "Reinstate" : "Suspend"}
            </Button>
          )}
        />
      </ListPanel>
    </>
  );
}
