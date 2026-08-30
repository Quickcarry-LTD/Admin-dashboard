"use client";

import { use, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import Panel, { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { Input } from "@/components/Field";
import { Alert, LoadingBlock, Spinner } from "@/components/Feedback";
import { DeliveryBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { formatDateTime, humanize, money } from "@/lib/format";
import type { Delivery } from "@/lib/types";

export default function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const deliveryId = Number(id);

  const delivery = useAsync(() => api.getDelivery(deliveryId), [deliveryId]);
  const history = useAsync(() => api.deliveryHistory(deliveryId), [deliveryId]);

  const [reassignOpen, setReassignOpen] = useState(false);
  const [riderId, setRiderId] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleReassign(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(riderId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setActionError("Enter the numeric ID of the rider to assign.");
      return;
    }

    setActionError("");
    setSaving(true);
    try {
      await api.reassignDelivery(deliveryId, parsed);
      setReassignOpen(false);
      setRiderId("");
      setNotice(`Delivery reassigned to rider #${parsed}.`);
      delivery.reload();
      history.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const d = delivery.data;

  return (
    <>
      <div>
        <Link
          href="/deliveries"
          className="inline-flex items-center gap-2 text-sm text-secondary-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          All deliveries
        </Link>
      </div>

      <PageHeader
        eyebrow={`Delivery #${id}`}
        title={d ? humanize(d.status) : "Delivery"}
        description={d?.package_description}
        action={
          d && (
            <Button variant="ghost" size="sm" onClick={() => setReassignOpen(true)}>
              <ArrowPathIcon className="h-4 w-4" />
              Reassign rider
            </Button>
          )
        }
      />

      {notice && <Alert tone="success">{notice}</Alert>}
      {delivery.error && <Alert>{delivery.error}</Alert>}

      {delivery.loading ? (
        <LoadingBlock label="Loading delivery" />
      ) : d ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <Panel title="Route">
              <Leg label="Pickup" address={d.pickup_address} lat={d.pickup_lat} lng={d.pickup_lng} />
              <div className="my-4 border-t-2 border-dashed border-border/20" />
              <Leg
                label="Dropoff"
                address={d.dropoff_address}
                lat={d.dropoff_lat}
                lng={d.dropoff_lng}
              />
            </Panel>

            <Panel title="Status history">
              {history.error ? (
                <Alert>{history.error}</Alert>
              ) : history.loading ? (
                <LoadingBlock label="Loading history" />
              ) : (history.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-secondary-foreground">
                  No status changes recorded for this delivery.
                </p>
              ) : (
                <ol className="flex flex-col">
                  {history.data?.map((entry, index) => (
                    <li
                      key={`${entry.status}-${entry.changed_at}-${index}`}
                      className="flex items-center gap-4 border-b border-border py-3 last:border-b-0"
                    >
                      <span className="tnum w-6 font-mono text-xs font-bold text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <DeliveryBadge status={entry.status} />
                      <span className="ml-auto text-xs text-secondary-foreground">
                        {formatDateTime(entry.changed_at)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>

          <div className="flex flex-col gap-5">
            <Panel title="Money">
              <Money label="Price" value={money(d.price)} strong />
              {d.discount_amount > 0 && (
                <Money label="Discount" value={`−${money(d.discount_amount)}`} />
              )}
              {d.coupon_code && <Detail label="Coupon" value={d.coupon_code} />}
              <Money label="Distance" value={`${d.distance_km.toFixed(2)} km`} />
            </Panel>

            <Panel title="Parties">
              <Detail label="Customer" value={`#${d.customer_id}`} />
              <Detail
                label="Rider"
                value={d.rider_id ? `#${d.rider_id}` : "Unassigned"}
              />
              <Detail label="Service" value={humanize(d.service_type)} />
              <Detail label="Package size" value={d.package_size} />
              {d.vehicle_type && <Detail label="Vehicle" value={d.vehicle_type} />}
              {d.duration_hours != null && (
                <Detail label="Duration" value={`${d.duration_hours} h`} />
              )}
            </Panel>

            <Panel title="Timeline">
              <Timestamps delivery={d} />
            </Panel>
          </div>
        </div>
      ) : null}

      <Modal
        open={reassignOpen}
        title={`Reassign delivery #${id}`}
        onClose={() => setReassignOpen(false)}
      >
        <form onSubmit={handleReassign} className="flex flex-col gap-4" noValidate>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            The API takes a rider ID, not a name. Find it on the{" "}
            <Link
              href="/riders"
              className="font-bold text-foreground underline decoration-primary decoration-4 underline-offset-4"
            >
              riders page
            </Link>
            . The new rider is notified straight away.
          </p>
          <Input
            id="rider_id"
            label="Rider ID"
            inputMode="numeric"
            value={riderId}
            onChange={(e) => setRiderId(e.target.value)}
            placeholder="e.g. 42"
          />
          {actionError && <Alert>{actionError}</Alert>}
          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving && <Spinner />}
              {saving ? "Reassigning" : "Reassign"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReassignOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Leg({
  label,
  address,
  lat,
  lng,
}: {
  label: string;
  address: string;
  lat: number;
  lng: number;
}) {
  return (
    <div>
      <p className="text-sm text-secondary-foreground">{label}</p>
      <p className="mt-1.5 text-sm text-foreground">{address}</p>
      <p className="tnum mt-1 font-mono text-xs text-muted-foreground">
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <span className="text-sm text-secondary-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function Money({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <span className="text-sm text-secondary-foreground">
        {label}
      </span>
      <span
        className={`tnum font-mono text-foreground ${strong ? "text-lg font-bold" : "text-sm"}`}
      >
        {value}
      </span>
    </div>
  );
}

// Only the stamps the delivery actually reached are shown — an unstarted
// job listing four "—" rows reads as missing data rather than as a job that
// simply has not got there yet.
function Timestamps({ delivery }: { delivery: Delivery }) {
  const stamps: [string, string | undefined][] = [
    ["Created", delivery.created_at],
    ["Accepted", delivery.accepted_at],
    ["Picked up", delivery.picked_up_at],
    ["Delivered", delivery.delivered_at],
    ["Cancelled", delivery.cancelled_at],
  ];
  const reached = stamps.filter(([, at]) => Boolean(at));

  return (
    <>
      {reached.map(([label, at]) => (
        <Detail key={label} label={label} value={formatDateTime(at as string)} />
      ))}
    </>
  );
}
