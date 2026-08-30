"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import Panel, { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import { Alert, EmptyState, LoadingBlock, Spinner } from "@/components/Feedback";
import {
  RiderStatusBadge,
  VerificationBadge,
} from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { formatDateTime, humanize, relativeTime } from "@/lib/format";
import type { VerificationStatus } from "@/lib/types";

export default function RiderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const riderId = Number(id);

  const rider = useAsync(() => api.getRider(riderId), [riderId]);
  const documents = useAsync(() => api.listRiderDocuments(riderId), [riderId]);
  const ratings = useAsync(() => api.riderRatings(riderId, 1, 5), [riderId]);

  const [busy, setBusy] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  async function run(key: string, fn: () => Promise<unknown>, message: string) {
    setActionError("");
    setNotice("");
    setBusy(key);
    try {
      await fn();
      setNotice(message);
      rider.reload();
      documents.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy("");
    }
  }

  const r = rider.data;
  const suspended = r?.user_status === "suspended";

  return (
    <>
      <div>
        <Link
          href="/riders"
          className="inline-flex items-center gap-2 text-sm text-secondary-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          All riders
        </Link>
      </div>

      <PageHeader
        eyebrow={`Rider #${id}`}
        title={r?.full_name ?? "Rider"}
        description={r ? `${r.email} · ${r.phone}` : undefined}
        action={
          r && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={suspended ? "primary" : "danger"}
                size="sm"
                disabled={busy !== ""}
                onClick={() =>
                  run(
                    "status",
                    () =>
                      api.setRiderStatus(riderId, suspended ? "active" : "suspended"),
                    suspended ? "Rider reinstated." : "Rider suspended.",
                  )
                }
              >
                {busy === "status" && <Spinner />}
                {suspended ? "Reinstate" : "Suspend"}
              </Button>
            </div>
          )
        }
      />

      {notice && <Alert tone="success">{notice}</Alert>}
      {actionError && <Alert>{actionError}</Alert>}
      {rider.error && <Alert>{rider.error}</Alert>}

      {rider.loading ? (
        <LoadingBlock label="Loading rider" />
      ) : r ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <Panel
              title="Verification"
              action={<VerificationBadge status={r.verification_status} />}
            >
              <p className="text-sm leading-relaxed text-secondary-foreground">
                Approving a rider lets them go online and receive jobs. Rejecting
                keeps the account but blocks dispatch. Either way the rider is
                notified.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(["approved", "pending", "rejected"] as VerificationStatus[]).map(
                  (status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={
                        status === "approved"
                          ? "primary"
                          : status === "rejected"
                            ? "danger"
                            : "ghost"
                      }
                      disabled={busy !== "" || r.verification_status === status}
                      onClick={() =>
                        run(
                          `verify-${status}`,
                          () => api.verifyRider(riderId, status),
                          `Verification set to ${status}.`,
                        )
                      }
                    >
                      {busy === `verify-${status}` && <Spinner />}
                      Mark {status}
                    </Button>
                  ),
                )}
              </div>
            </Panel>

            <Panel title="Documents" bodyClassName="">
              {documents.error ? (
                <div className="p-5">
                  <Alert>{documents.error}</Alert>
                </div>
              ) : documents.loading ? (
                <LoadingBlock label="Loading documents" />
              ) : (documents.data?.length ?? 0) === 0 ? (
                <EmptyState
                  icon={DocumentTextIcon}
                  title="No documents uploaded"
                  description="The rider has not submitted licence or vehicle papers yet."
                />
              ) : (
                <ul>
                  {documents.data?.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {humanize(doc.doc_type)}
                        </p>
                        <p className="truncate text-xs text-secondary-foreground">
                          {doc.original_filename} · {relativeTime(doc.uploaded_at)}
                        </p>
                        {doc.admin_notes && (
                          <p className="mt-1 text-xs text-secondary-foreground">{doc.admin_notes}</p>
                        )}
                      </div>
                      <VerificationBadge status={doc.status} />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy !== ""}
                          onClick={() =>
                            run(
                              `doc-dl-${doc.id}`,
                              () =>
                                api.downloadRiderDocument(doc.id, doc.original_filename),
                              "Document downloaded.",
                            )
                          }
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          File
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={busy !== "" || doc.status === "approved"}
                          onClick={() =>
                            run(
                              `doc-ok-${doc.id}`,
                              () =>
                                api.updateRiderDocument(doc.id, { status: "approved" }),
                              "Document approved.",
                            )
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy !== "" || doc.status === "rejected"}
                          onClick={() =>
                            run(
                              `doc-no-${doc.id}`,
                              () =>
                                api.updateRiderDocument(doc.id, { status: "rejected" }),
                              "Document rejected.",
                            )
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Recent ratings" bodyClassName="">
              {ratings.loading ? (
                <LoadingBlock label="Loading ratings" />
              ) : (ratings.data?.items.length ?? 0) === 0 ? (
                <EmptyState
                  icon={StarIcon}
                  title="No ratings yet"
                  description="Customers rate a rider after a delivery completes."
                />
              ) : (
                <ul>
                  {ratings.data?.items.map((rating) => (
                    <li
                      key={rating.id}
                      className="border-b border-border px-5 py-4 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
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
              )}
            </Panel>
          </div>

          <div className="flex flex-col gap-5">
            <Panel title="Status" action={<RiderStatusBadge status={r.user_status} online={r.is_online} />}>
              <Detail label="Account" value={humanize(r.user_status)} />
              <Detail label="Presence" value={r.is_online ? "Online" : "Offline"} />
              {r.last_location_at && (
                <Detail label="Last seen" value={formatDateTime(r.last_location_at)} />
              )}
              {r.current_lat != null && r.current_lng != null && (
                <Detail
                  label="Position"
                  value={`${r.current_lat.toFixed(5)}, ${r.current_lng.toFixed(5)}`}
                />
              )}
              <Detail label="Joined" value={formatDateTime(r.created_at)} />
            </Panel>

            <Panel title="Vehicle">
              <Detail label="Type" value={r.vehicle_type} />
              <Detail label="Plate" value={r.plate_number} />
              <Detail label="Licence" value={r.license_number} />
            </Panel>

            <Panel title="Rating">
              <Detail
                label="Average"
                value={r.rating_count > 0 ? r.rating_avg.toFixed(2) : "Unrated"}
              />
              <Detail label="Ratings" value={String(r.rating_count)} />
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
      <span className="text-sm text-secondary-foreground">
        {label}
      </span>
      <span className="tnum text-right text-sm text-foreground">{value}</span>
    </div>
  );
}
