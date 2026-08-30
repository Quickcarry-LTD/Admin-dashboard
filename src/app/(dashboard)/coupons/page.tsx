"use client";

import { useState, type FormEvent } from "react";
import { PlusIcon, TicketIcon } from "@heroicons/react/24/solid";
import SearchInput from "@/components/SearchInput";
import { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { Input } from "@/components/Field";
import ListPanel from "@/components/ListPanel";
import RecordList, { type Field } from "@/components/RecordList";
import { ActiveBadge } from "@/components/StatusBadge";
import { Alert, Spinner } from "@/components/Feedback";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { formatCalendarDate, money } from "@/lib/format";
import type { Coupon, DiscountType } from "@/lib/types";

const LIMIT = 20;

// A code is "exhausted" once redemptions hit its cap — the number an
// operator is actually scanning this table for.
function exhausted(c: Coupon) {
  return c.max_redemptions != null && c.redemptions_count >= c.max_redemptions;
}

const FIELDS: Field<Coupon>[] = [
  {
    key: "code",
    label: "Code",
    card: false,
    render: (c) => (
      <span className="border border-border bg-card-muted px-2 py-1 font-mono text-sm text-foreground">
        {c.code}
      </span>
    ),
  },
  {
    key: "discount",
    label: "Discount",
    cellClassName: "tnum font-mono text-base font-semibold text-foreground",
    render: (c) =>
      c.discount_type === "percentage" ? `${c.discount_value}%` : money(c.discount_value),
  },
  {
    key: "redemptions",
    label: "Redemptions",
    render: (c) => (
      <>
        <span
          className={`tnum font-mono text-sm ${
            exhausted(c) ? "font-bold text-danger" : "text-foreground"
          }`}
        >
          {c.redemptions_count}
          {c.max_redemptions != null ? ` / ${c.max_redemptions}` : ""}
        </span>
        {c.max_redemptions == null && (
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Uncapped</p>
        )}
      </>
    ),
  },
  {
    key: "minimum",
    label: "Minimum",
    cellClassName: "tnum text-sm text-secondary-foreground",
    render: (c) => (c.min_order_value != null ? money(c.min_order_value) : "—"),
  },
  {
    key: "expires",
    label: "Expires",
    cellClassName: "text-xs text-secondary-foreground",
    render: (c) => (c.expires_at ? formatCalendarDate(c.expires_at) : "Never"),
  },
  {
    key: "state",
    label: "State",
    card: false,
    render: (c) => <ActiveBadge active={c.active} />,
  },
];

// The API parses expires_at with time.Parse(time.RFC3339) and rejects
// anything else. <input type="date"> yields "2026-12-31", so the end of that
// day in UTC is what gets sent — an expiry date means "usable through that
// day", not "expires at midnight as it begins".
function toRfc3339(date: string): string | null {
  return date ? `${date}T23:59:59Z` : null;
}

function toDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : "";
}

type FormState = {
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  max_redemptions: string;
  min_order_value: string;
  expires_at: string;
  active: boolean;
};

const BLANK: FormState = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  max_redemptions: "",
  min_order_value: "",
  expires_at: "",
  active: true,
};

export default function CouponsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const { data, error, loading, reload } = useAsync(
    () => api.listCoupons(page, LIMIT, search),
    [page, search],
  );

  function openCreate() {
    setForm(BLANK);
    setEditing(null);
    setCreating(true);
    setActionError("");
  }

  function openEdit(coupon: Coupon) {
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      max_redemptions: coupon.max_redemptions != null ? String(coupon.max_redemptions) : "",
      min_order_value: coupon.min_order_value != null ? String(coupon.min_order_value) : "",
      expires_at: toDateInput(coupon.expires_at),
      active: coupon.active,
    });
    setEditing(coupon);
    setCreating(false);
    setActionError("");
  }

  function close() {
    setEditing(null);
    setCreating(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const value = Number(form.discount_value);
    if (!form.code.trim() || form.code.trim().length < 3) {
      setActionError("Code must be at least 3 characters.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setActionError("Discount value must be greater than zero.");
      return;
    }
    if (form.discount_type === "percentage" && value > 100) {
      setActionError("A percentage discount cannot exceed 100.");
      return;
    }

    // Optional numerics are pointers server-side: omitting them means "no
    // cap"/"no minimum", while sending 0 would fail the gte=1 binding on
    // max_redemptions. Empty input therefore has to become null, not 0.
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: value,
      max_redemptions: form.max_redemptions ? Number(form.max_redemptions) : null,
      min_order_value: form.min_order_value ? Number(form.min_order_value) : null,
      expires_at: toRfc3339(form.expires_at),
      active: form.active,
    };

    setActionError("");
    setBusy(true);
    try {
      if (editing) {
        await api.updateCoupon(editing.id, payload);
        setNotice(`Coupon ${payload.code} updated.`);
      } else {
        await api.createCoupon(payload);
        setNotice(`Coupon ${payload.code} created.`);
      }
      close();
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const items = data?.items ?? [];
  const open = creating || editing !== null;

  return (
    <>
      <PageHeader
        eyebrow="Growth"
        title="Coupons"
        description="Discount codes customers can apply at checkout. The pricing engine reads these when it quotes a fare."
        action={
          <Button variant="primary" size="sm" onClick={openCreate}>
            <PlusIcon className="h-4 w-4" />
            New coupon
          </Button>
        }
      />

      {notice && <Alert tone="success">{notice}</Alert>}

      <ListPanel
        title="Coupon codes"
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        emptyIcon={TicketIcon}
        emptyTitle="No coupons"
        emptyDescription="Create a code to start discounting fares."
        page={data?.page ?? page}
        limit={data?.limit ?? LIMIT}
        total={data?.total ?? 0}
        onPageChange={setPage}
        toolbar={
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search codes"
            className="w-full sm:w-72"
          />
        }
      >
        <RecordList
          rows={items}
          fields={FIELDS}
          getKey={(c) => String(c.id)}
          minWidth={880}
          cardTitle={(c) => (
            <span className="font-mono">{c.code}</span>
          )}
          cardSubtitle={(c) =>
            c.discount_type === "percentage"
              ? `${c.discount_value}% off`
              : `${money(c.discount_value)} off`
          }
          cardBadge={(c) => <ActiveBadge active={c.active} />}
          actions={(c) => (
            <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
              Edit
            </Button>
          )}
        />
      </ListPanel>

      <Modal
        open={open}
        title={editing ? `Edit ${editing.code}` : "New coupon"}
        onClose={close}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="code"
            label="Code"
            hint="3–30 characters"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="WELCOME10"
            className="font-mono uppercase"
          />

          <div>
            <p className="text-sm text-secondary-foreground">
              Discount type
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["percentage", "fixed"] as DiscountType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={form.discount_type === type}
                  onClick={() => setForm({ ...form, discount_type: type })}
                  className={`border border-border px-3 py-2.5 text-sm transition-transform hover:-translate-y-0.5 ${
                    form.discount_type === type ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <Input
            id="discount_value"
            label={form.discount_type === "percentage" ? "Percent off" : "Naira off"}
            inputMode="decimal"
            value={form.discount_value}
            onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
            placeholder={form.discount_type === "percentage" ? "10" : "500"}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="max_redemptions"
              label="Max uses"
              hint="Blank = uncapped"
              inputMode="numeric"
              value={form.max_redemptions}
              onChange={(e) => setForm({ ...form, max_redemptions: e.target.value })}
              placeholder="1000"
            />
            <Input
              id="min_order_value"
              label="Minimum fare"
              hint="Blank = none"
              inputMode="decimal"
              value={form.min_order_value}
              onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
              placeholder="2000"
            />
          </div>

          <Input
            id="expires_at"
            label="Expires"
            hint="Blank = never"
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />

          <label className="flex items-center gap-3 border border-border bg-card-muted px-4 py-3">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 accent-ink"
            />
            <span className="text-sm text-foreground">
              Active — customers can redeem this now
            </span>
          </label>

          {actionError && <Alert>{actionError}</Alert>}

          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="sm" disabled={busy}>
              {busy && <Spinner className="h-4 w-4 border-cream border-t-transparent" />}
              {editing ? "Save changes" : "Create coupon"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
