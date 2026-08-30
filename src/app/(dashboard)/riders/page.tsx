"use client";

import { useState } from "react";
import { StarIcon, UsersIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "@/components/Panel";
import ListPanel from "@/components/ListPanel";
import RecordList, { type Field } from "@/components/RecordList";
import { RiderStatusBadge, VerificationBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { relativeTime } from "@/lib/format";
import SearchInput, { FilterChip } from "@/components/SearchInput";
import type { Rider, VerificationStatus } from "@/lib/types";

const LIMIT = 20;

const FIELDS: Field<Rider>[] = [
  {
    key: "rider",
    label: "Rider",
    card: false,
    render: (r) => (
      <>
        <p className="text-sm font-bold text-foreground">{r.full_name}</p>
        <p className="tnum mt-0.5 font-mono text-xs text-muted-foreground">
          #{r.id} · joined {relativeTime(r.created_at)}
        </p>
      </>
    ),
  },
  {
    key: "contact",
    label: "Contact",
    render: (r) => (
      <>
        <p className="max-w-[180px] truncate text-xs text-secondary-foreground">{r.email}</p>
        <p className="tnum text-xs text-secondary-foreground">{r.phone}</p>
      </>
    ),
  },
  {
    key: "vehicle",
    label: "Vehicle",
    render: (r) => (
      <>
        <p className="text-sm text-foreground">{r.vehicle_type}</p>
        <p className="tnum mt-0.5 font-mono text-xs uppercase text-muted-foreground">{r.plate_number}</p>
      </>
    ),
  },
  {
    key: "rating",
    label: "Rating",
    render: (r) =>
      r.rating_count > 0 ? (
        <span className="tnum inline-flex items-center gap-1 font-mono text-sm text-foreground">
          <StarIcon className="h-3.5 w-3.5 text-warning" />
          {r.rating_avg.toFixed(1)}
          <span className="text-xs text-muted-foreground">({r.rating_count})</span>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Unrated</span>
      ),
  },
  {
    key: "verification",
    label: "Verification",
    render: (r) => <VerificationBadge status={r.verification_status} />,
  },
  {
    key: "status",
    label: "Status",
    card: false,
    render: (r) => <RiderStatusBadge status={r.user_status} online={r.is_online} />,
  },
];

export default function RidersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [verification, setVerification] = useState<VerificationStatus | "">("");

  const { data, error, loading } = useAsync(
    () => api.listRiders(page, LIMIT, search, verification),
    [page, search, verification],
  );

  const items = data?.items ?? [];
  const online = items.filter((r) => r.is_online).length;

  // Both filters reset to page 1 — narrowing while deep in the list would
  // otherwise land on a page past the end of the new result set.
  function applySearch(next: string) {
    setSearch(next);
    setPage(1);
  }
  function applyVerification(next: VerificationStatus | "") {
    setVerification(next);
    setPage(1);
  }

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Riders"
        description="Everyone carrying for QuickCarry. Vehicle and licence details live on the rider record — open one to review documents or change verification."
      />

      <ListPanel
        title="Riders"
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyIcon={UsersIcon}
        emptyTitle={search || verification ? "No riders match" : "No riders registered"}
        emptyDescription={
          search || verification
            ? "Nothing matches that search or filter."
            : "Riders appear here once they sign up or a fleet business adds them."
        }
        page={data?.page ?? page}
        limit={data?.limit ?? LIMIT}
        total={data?.total ?? 0}
        onPageChange={setPage}
        toolbar={
          <>
            <SearchInput
              value={search}
              onChange={applySearch}
              placeholder="Search by name, email, phone or plate"
              className="w-full sm:w-96"
            />
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip active={verification === ""} onClick={() => applyVerification("")}>
                All
              </FilterChip>
              {(["pending", "approved", "rejected"] as VerificationStatus[]).map((v) => (
                <FilterChip
                  key={v}
                  active={verification === v}
                  onClick={() => applyVerification(v)}
                >
                  {v}
                </FilterChip>
              ))}
            </div>
            {/* Online count covers this page only — there is no aggregate
                presence endpoint, so anything else would be a guess. */}
            <p className="ml-auto text-sm text-secondary-foreground">
              {online} online on this page
            </p>
          </>
        }
      >
        <RecordList
          rows={items}
          fields={FIELDS}
          getKey={(r) => String(r.id)}
          minWidth={900}
          href={(r) => `/riders/${r.id}`}
          cardTitle={(r) => r.full_name}
          cardSubtitle={(r) => `#${r.id} · joined ${relativeTime(r.created_at)}`}
          cardBadge={(r) => <RiderStatusBadge status={r.user_status} online={r.is_online} />}
        />
      </ListPanel>
    </>
  );
}
