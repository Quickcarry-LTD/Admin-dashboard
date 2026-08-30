"use client";

import { useState } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/Panel";
import ListPanel from "@/components/ListPanel";
import RecordList, { type Field } from "@/components/RecordList";
import { Badge } from "@/components/StatusBadge";
import SearchInput, { FilterChip } from "@/components/SearchInput";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { formatDateTime, humanize, relativeTime } from "@/lib/format";
import type { AuditLog } from "@/lib/types";

const LIMIT = 20;

// The status the API returned for the action, not the entity's state. A 4xx
// here is a rejected attempt, which is exactly what an audit trail exists to
// preserve — so it is shown rather than filtered out.
function outcomeTone(code: number) {
  if (code >= 500) return "danger" as const;
  if (code >= 400) return "warning" as const;
  return "success" as const;
}

const FIELDS: Field<AuditLog>[] = [
  {
    key: "action",
    label: "Action",
    card: false,
    render: (l) => (
      <>
        <p className="font-medium text-foreground">{humanize(l.action)}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {l.entity_type}
          {l.entity_id != null ? ` #${l.entity_id}` : ""}
        </p>
      </>
    ),
  },
  {
    key: "admin",
    label: "Who",
    render: (l) => (
      <>
        <p className="text-foreground">{l.admin_name}</p>
        <p className="truncate text-sm text-muted-foreground">{l.admin_email}</p>
      </>
    ),
  },
  {
    key: "detail",
    label: "Change",
    cellClassName: "max-w-[280px]",
    render: (l) =>
      l.detail && Object.keys(l.detail).length > 0 ? (
        <code className="block truncate rounded bg-card-muted px-2 py-1 font-mono text-sm text-secondary-foreground">
          {JSON.stringify(l.detail)}
        </code>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "outcome",
    label: "Outcome",
    card: false,
    render: (l) => <Badge tone={outcomeTone(l.status_code)}>HTTP {l.status_code}</Badge>,
  },
  {
    key: "ip",
    label: "From",
    cellClassName: "tnum text-secondary-foreground",
    render: (l) => l.ip_address ?? "—",
  },
  {
    key: "when",
    label: "When",
    cellClassName: "text-secondary-foreground",
    render: (l) => (
      <span title={formatDateTime(l.created_at)}>{relativeTime(l.created_at)}</span>
    ),
  },
];

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");

  const { data, error, loading } = useAsync(
    () => api.listAuditLogs(page, LIMIT, action, "", search),
    [page, action, search],
  );
  // The filter offers exactly the actions that have been recorded, so it can
  // never drift from what the middleware actually writes.
  const actions = useAsync(() => api.auditActions(), []);

  const items = data?.items ?? [];
  const filtered = Boolean(search || action);

  return (
    <>
      <PageHeader
        eyebrow="Governance"
        title="Audit trail"
        description="Every state-changing admin action, with who did it and what the API answered. Append-only — there is no endpoint to edit or delete an entry."
      />

      <ListPanel
        title="Admin actions"
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyIcon={ShieldCheckIcon}
        emptyTitle={filtered ? "No actions match" : "No actions recorded yet"}
        emptyDescription={
          filtered
            ? "Nothing matches that search or action filter."
            : "Entries appear here as admins change things. Reads are not logged."
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
              placeholder="Search by admin or action"
              className="w-full sm:w-80"
            />
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                active={action === ""}
                onClick={() => {
                  setAction("");
                  setPage(1);
                }}
              >
                All
              </FilterChip>
              {(actions.data ?? []).map((a) => (
                <FilterChip
                  key={a}
                  active={action === a}
                  onClick={() => {
                    setAction(a);
                    setPage(1);
                  }}
                >
                  {humanize(a)}
                </FilterChip>
              ))}
            </div>
          </>
        }
      >
        <RecordList
          rows={items}
          fields={FIELDS}
          getKey={(l) => String(l.id)}
          minWidth={980}
          cardTitle={(l) => humanize(l.action)}
          cardSubtitle={(l) =>
            `${l.admin_name} · ${l.entity_type}${l.entity_id != null ? ` #${l.entity_id}` : ""}`
          }
          cardBadge={(l) => <Badge tone={outcomeTone(l.status_code)}>{l.status_code}</Badge>}
        />
      </ListPanel>
    </>
  );
}
