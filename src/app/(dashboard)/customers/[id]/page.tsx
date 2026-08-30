"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, StarIcon } from "@heroicons/react/24/solid";
import Panel, { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import { Alert, EmptyState, LoadingBlock, Spinner } from "@/components/Feedback";
import { UserStatusBadge } from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { formatDateTime, humanize, relativeTime } from "@/lib/format";

const RATINGS_LIMIT = 10;

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const customerId = Number(id);

  const [ratingsPage, setRatingsPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const customer = useAsync(() => api.getCustomer(customerId), [customerId]);
  const ratings = useAsync(
    () => api.customerRatings(customerId, ratingsPage, RATINGS_LIMIT),
    [customerId, ratingsPage],
  );

  const c = customer.data;
  const suspended = c?.status === "suspended";

  async function toggleStatus() {
    if (!c) return;
    setActionError("");
    setNotice("");
    setBusy(true);
    try {
      await api.setCustomerStatus(customerId, suspended ? "active" : "suspended");
      setNotice(suspended ? "Customer reinstated." : "Customer suspended.");
      customer.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  // These are ratings the customer RECEIVED — riders rate customers after a
  // job, same as the other way round. A low average here is a signal about
  // the customer, not about the service.
  const received = ratings.data;
  const average =
    received && received.items.length > 0
      ? received.items.reduce((sum, r) => sum + r.rating, 0) / received.items.length
      : null;

  return (
    <>
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 text-sm text-secondary-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          All customers
        </Link>
      </div>

      <PageHeader
        eyebrow={`Customer #${id}`}
        title={c?.full_name ?? "Customer"}
        description={c ? `${c.email} · ${c.phone}` : undefined}
        action={
          c && (
            <Button
              variant={suspended ? "primary" : "danger"}
              size="sm"
              disabled={busy}
              onClick={toggleStatus}
            >
              {busy && <Spinner />}
              {suspended ? "Reinstate" : "Suspend"}
            </Button>
          )
        }
      />

      {notice && <Alert tone="success">{notice}</Alert>}
      {actionError && <Alert>{actionError}</Alert>}
      {customer.error && <Alert>{customer.error}</Alert>}

      {customer.loading ? (
        <LoadingBlock label="Loading customer" />
      ) : c ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <Panel
              title="Ratings received"
              bodyClassName=""
              action={
                average !== null && (
                  <span className="tnum inline-flex items-center gap-1 font-mono text-base font-semibold text-foreground">
                    <StarIcon className="h-4 w-4 text-warning" />
                    {average.toFixed(1)}
                    <span className="text-xs font-normal text-muted-foreground">this page</span>
                  </span>
                )
              }
            >
              {ratings.error ? (
                <div className="p-5">
                  <Alert>{ratings.error}</Alert>
                </div>
              ) : ratings.loading ? (
                <LoadingBlock label="Loading ratings" />
              ) : (received?.items.length ?? 0) === 0 ? (
                <EmptyState
                  icon={StarIcon}
                  title="No ratings yet"
                  description="Riders rate a customer after a delivery completes."
                />
              ) : (
                <>
                  <ul>
                    {received?.items.map((rating) => (
                      <li
                        key={rating.id}
                        className="border-b border-border px-5 py-4 last:border-b-0"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="tnum inline-flex items-center gap-1 font-mono text-base font-semibold text-foreground">
                            <StarIcon className="h-3.5 w-3.5 text-warning" />
                            {rating.rating}
                          </span>
                          <Link
                            href={`/deliveries/${rating.delivery_id}`}
                            className="tnum font-mono text-xs text-secondary-foreground underline decoration-primary decoration-2 underline-offset-2"
                          >
                            #{rating.delivery_id}
                          </Link>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {relativeTime(rating.created_at)}
                          </span>
                        </div>
                        {rating.comment && (
                          <p className="mt-1.5 text-sm text-secondary-foreground">{rating.comment}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Pagination
                    page={received?.page ?? ratingsPage}
                    limit={received?.limit ?? RATINGS_LIMIT}
                    total={received?.total ?? 0}
                    onPageChange={setRatingsPage}
                  />
                </>
              )}
            </Panel>
          </div>

          <div className="flex flex-col gap-5">
            <Panel title="Account" action={<UserStatusBadge status={c.status} />}>
              <Detail label="Status" value={humanize(c.status)} />
              <Detail label="Email" value={c.email} />
              <Detail label="Phone" value={c.phone} />
              <Detail label="Registered" value={formatDateTime(c.created_at)} />
            </Panel>

            {/* GET /admin/customers/:id returns adminhandler.userView — id,
                name, email, phone, status, created_at and nothing else. There
                is no per-customer delivery list or spend total on the admin
                API, so the board is the place to look those up. */}
            <Panel title="Their deliveries">
              <p className="text-sm leading-relaxed text-secondary-foreground">
                The admin customer record carries no booking history. Filter the
                delivery board to find this customer&apos;s jobs.
              </p>
              <Link
                href="/deliveries"
                className="mt-3 inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-sm text-foreground transition-transform hover:-translate-y-0.5"
              >
                Open the board
              </Link>
            </Panel>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <span className="shrink-0 text-sm text-secondary-foreground">
        {label}
      </span>
      <span className="min-w-0 break-words text-right text-sm text-foreground">{value}</span>
    </div>
  );
}
