"use client";

import { useState, type FormEvent } from "react";
import { BanknotesIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { Textarea } from "@/components/Field";
import ListPanel from "@/components/ListPanel";
import RecordList, { type Field } from "@/components/RecordList";
import { WithdrawalBadge } from "@/components/StatusBadge";
import { Alert, Spinner } from "@/components/Feedback";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { money, relativeTime } from "@/lib/format";
import type { Withdrawal, WithdrawalDecision } from "@/lib/types";

const LIMIT = 20;

const FIELDS: Field<Withdrawal>[] = [
  {
    key: "id",
    label: "Request",
    card: false,
    render: (w) => (
      <>
        <span className="tnum font-mono text-base font-semibold text-foreground">#{w.id}</span>
        <p className="tnum mt-0.5 font-mono text-[11px] text-muted-foreground">user #{w.user_id}</p>
      </>
    ),
  },
  {
    key: "beneficiary",
    label: "Beneficiary",
    render: (w) => (
      <>
        <p className="text-sm text-foreground">{w.account_name}</p>
        <p className="tnum font-mono text-xs text-secondary-foreground">
          {w.account_number} · {w.bank_code}
        </p>
        {w.admin_notes && (
          <p className="mt-1 max-w-[220px] text-[11px] text-secondary-foreground">{w.admin_notes}</p>
        )}
      </>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    cellClassName: "tnum font-mono text-base font-semibold text-foreground",
    render: (w) => money(w.amount),
  },
  {
    key: "status",
    label: "Status",
    card: false,
    render: (w) => <WithdrawalBadge status={w.status} />,
  },
  {
    key: "requested",
    label: "Requested",
    cellClassName: "text-xs text-secondary-foreground",
    render: (w) => relativeTime(w.created_at),
  },
];

export default function WithdrawalsPage() {
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  // The manual settle dialog. Recording an outcome by hand needs a note
  // saying why, so it is a form rather than a bare button.
  const [settling, setSettling] = useState<{
    withdrawal: Withdrawal;
    decision: WithdrawalDecision;
  } | null>(null);
  const [notes, setNotes] = useState("");

  const { data, error, loading, reload } = useAsync(
    () => api.listWithdrawals(page, LIMIT),
    [page],
  );

  async function handlePayout(w: Withdrawal) {
    setActionError("");
    setNotice("");
    setBusyId(w.id);
    try {
      await api.payoutWithdrawal(w.id);
      // The gateway webhook is what finally marks it completed, so the row
      // will read "processing" rather than "completed" after this returns.
      setNotice(
        `Payout for #${w.id} sent to the gateway. It stays in processing until the transfer resolves.`,
      );
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleSettle(e: FormEvent) {
    e.preventDefault();
    if (!settling) return;

    setActionError("");
    setBusyId(settling.withdrawal.id);
    try {
      await api.updateWithdrawal(settling.withdrawal.id, settling.decision, notes);
      setNotice(`Withdrawal #${settling.withdrawal.id} marked ${settling.decision}.`);
      setSettling(null);
      setNotes("");
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
        eyebrow="Money"
        title="Withdrawals"
        description="Cash-out requests from riders, merchants and fleet businesses. Send one through the gateway, or record an outcome you settled by hand."
      />

      {notice && <Alert tone="success">{notice}</Alert>}
      {actionError && <Alert>{actionError}</Alert>}

      <ListPanel
        title="Withdrawal requests"
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyIcon={BanknotesIcon}
        emptyTitle="No withdrawal requests"
        emptyDescription="Requests appear here when a wallet holder cashes out."
        page={data?.page ?? page}
        limit={data?.limit ?? LIMIT}
        total={data?.total ?? 0}
        onPageChange={setPage}
      >
        <RecordList
          rows={items}
          fields={FIELDS}
          getKey={(w) => String(w.id)}
          minWidth={940}
          cardTitle={(w) => `#${w.id}`}
          cardSubtitle={(w) => `${w.account_name} · user #${w.user_id}`}
          cardBadge={(w) => <WithdrawalBadge status={w.status} />}
          actions={(w) => (
            <>
              <Button
                size="sm"
                variant="primary"
                // Only a pending request can be sent to the gateway; one
                // already processing would double-pay.
                disabled={busyId !== null || w.status !== "pending"}
                onClick={() => handlePayout(w)}
              >
                {busyId === w.id && <Spinner />}
                Pay out
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={
                  busyId !== null || w.status === "completed" || w.status === "failed"
                }
                onClick={() => {
                  setNotes("");
                  setSettling({ withdrawal: w, decision: "completed" });
                }}
              >
                Settle
              </Button>
            </>
          )}
        />
      </ListPanel>

      <Modal
        open={settling !== null}
        title={`Settle withdrawal #${settling?.withdrawal.id ?? ""}`}
        onClose={() => setSettling(null)}
      >
        <form onSubmit={handleSettle} className="flex flex-col gap-4" noValidate>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            Records the final outcome without going through the gateway — for a
            transfer you made another way, or one you know failed. The wallet
            holder is notified.
          </p>

          <div className="flex gap-2">
            {(["completed", "failed"] as WithdrawalDecision[]).map((decision) => (
              <button
                key={decision}
                type="button"
                aria-pressed={settling?.decision === decision}
                onClick={() =>
                  setSettling((s) => (s ? { ...s, decision } : s))
                }
                className={`flex-1 border border-border px-3 py-2.5 text-sm transition-transform hover:-translate-y-0.5 ${
                  settling?.decision === decision
                    ? decision === "completed"
                      ? "bg-success text-white"
                      : "bg-danger text-white"
                    : "bg-card text-foreground"
                }`}
              >
                {decision}
              </button>
            ))}
          </div>

          <Textarea
            id="admin_notes"
            label="Notes"
            hint="Optional"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reference, or why it failed"
          />

          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="sm" disabled={busyId !== null}>
              {busyId !== null && <Spinner className="h-4 w-4 border-cream border-t-transparent" />}
              Save outcome
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSettling(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
