"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { Textarea } from "@/components/Field";
import ListPanel from "@/components/ListPanel";
import RecordList, { type Field } from "@/components/RecordList";
import { ComplaintBadge } from "@/components/StatusBadge";
import { Alert, Spinner } from "@/components/Feedback";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { humanize, relativeTime } from "@/lib/format";
import SearchInput, { FilterChip } from "@/components/SearchInput";
import { COMPLAINT_STATUSES, type Complaint, type ComplaintStatus } from "@/lib/types";

const LIMIT = 20;

const FIELDS: Field<Complaint>[] = [
  {
    key: "id",
    label: "Complaint",
    card: false,
    render: (c) => (
      <>
        <span className="tnum font-mono text-base font-semibold text-foreground">#{c.id}</span>
        <p className="tnum mt-0.5 font-mono text-[11px] text-muted-foreground">
          user #{c.raised_by_user_id}
        </p>
      </>
    ),
  },
  {
    key: "subject",
    label: "Subject",
    render: (c) => (
      <>
        <p className="max-w-[280px] text-sm font-bold text-foreground">{c.subject}</p>
        <p className="mt-0.5 max-w-[280px] truncate text-xs text-secondary-foreground">{c.description}</p>
        {c.admin_notes && (
          <p className="mt-1 max-w-[280px] truncate text-[11px] text-muted-foreground">
            Note: {c.admin_notes}
          </p>
        )}
      </>
    ),
  },
  {
    key: "delivery",
    label: "Delivery",
    render: (c) =>
      c.delivery_id ? (
        <Link
          href={`/deliveries/${c.delivery_id}`}
          className="tnum font-mono text-xs text-foreground underline decoration-primary decoration-2 underline-offset-2"
        >
          #{c.delivery_id}
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    key: "status",
    label: "Status",
    card: false,
    render: (c) => <ComplaintBadge status={c.status} />,
  },
  {
    key: "raised",
    label: "Raised",
    cellClassName: "text-xs text-secondary-foreground",
    render: (c) => relativeTime(c.created_at),
  },
];

export default function ComplaintsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ComplaintStatus | "">("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const [editing, setEditing] = useState<Complaint | null>(null);
  const [nextStatus, setNextStatus] = useState<ComplaintStatus>("in_progress");
  const [notes, setNotes] = useState("");

  const { data, error, loading, reload } = useAsync(
    () => api.listComplaints(page, LIMIT, status, search),
    [page, status, search],
  );

  function open(complaint: Complaint) {
    setEditing(complaint);
    setNextStatus(complaint.status);
    setNotes(complaint.admin_notes ?? "");
    setActionError("");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;

    setActionError("");
    setBusy(true);
    try {
      await api.updateComplaint(editing.id, nextStatus, notes);
      setNotice(`Complaint #${editing.id} is now ${humanize(nextStatus)}.`);
      setEditing(null);
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Complaints"
        description="Issues raised by customers and riders. Changing a status emails the person who raised it, so it is never a silent edit."
      />

      {notice && <Alert tone="success">{notice}</Alert>}

      <ListPanel
        title="Complaint queue"
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyIcon={ChatBubbleLeftRightIcon}
        emptyTitle={status ? `Nothing ${humanize(status)}` : "No complaints"}
        emptyDescription={
          status
            ? "No complaint is in that state right now."
            : "Complaints raised against deliveries appear here."
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
              placeholder="Search subject or description"
              className="w-full sm:w-80"
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
            {COMPLAINT_STATUSES.map((s) => (
              <FilterChip
                key={s}
                active={status === s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
              >
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
          getKey={(c) => String(c.id)}
          minWidth={860}
          cardTitle={(c) => `#${c.id} · ${c.subject}`}
          cardSubtitle={(c) => `Raised by user #${c.raised_by_user_id}`}
          cardBadge={(c) => <ComplaintBadge status={c.status} />}
          actions={(c) => (
            <Button size="sm" variant="ghost" onClick={() => open(c)}>
              Handle
            </Button>
          )}
        />
      </ListPanel>

      <Modal
        open={editing !== null}
        title={`Complaint #${editing?.id ?? ""}`}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>
            <div className="border border-border bg-card-muted p-4">
              <p className="text-sm font-bold text-foreground">{editing.subject}</p>
              <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
                {editing.description}
              </p>
            </div>

            <div>
              <p className="text-sm text-secondary-foreground">
                Status
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {COMPLAINT_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={nextStatus === s}
                    onClick={() => setNextStatus(s)}
                    className={`border border-border px-3 py-2.5 text-sm transition-transform hover:-translate-y-0.5 ${
                      nextStatus === s ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                    }`}
                  >
                    {humanize(s)}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              id="admin_notes"
              label="Admin notes"
              hint="Max 2000 characters"
              rows={4}
              maxLength={2000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was done about this?"
            />

            {actionError && <Alert>{actionError}</Alert>}

            <div className="flex gap-3">
              <Button type="submit" variant="primary" size="sm" disabled={busy}>
                {busy && <Spinner className="h-4 w-4 border-cream border-t-transparent" />}
                Save and notify
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
