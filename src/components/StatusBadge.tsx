import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { humanize } from "@/lib/format";
import type {
  ComplaintStatus,
  DeliveryStatus,
  PaymentStatus,
  VerificationStatus,
  WithdrawalStatus,
} from "@/lib/types";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "brand" | "progress";

const TONES: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-neutral-soft text-neutral",
  brand: "bg-primary-soft text-primary-accent",
  // "In flight, nothing is wrong yet" — a payout being disbursed, a rider
  // mid-route. Distinct from warning, which means a human is needed.
  progress: "bg-primary-soft text-primary-accent",
};

/**
 * The pill every status in the app renders as. A soft tint with a matching
 * foreground rather than a solid block, so a table of twenty rows does not
 * turn into a colour chart.
 */
export function Badge({
  tone = "neutral",
  dot = true,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1",
        "text-sm font-medium capitalize",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

// A delivery's lifecycle: waiting, hunting for a rider, the handoff steps,
// then a terminal state.
const deliveryTones: Record<DeliveryStatus, Tone> = {
  pending: "neutral",
  searching: "warning",
  accepted: "progress",
  picked_up: "progress",
  in_transit: "info",
  delivered: "success",
  cancelled: "danger",
};

export function DeliveryBadge({ status }: { status: DeliveryStatus }) {
  return <Badge tone={deliveryTones[status] ?? "neutral"}>{humanize(status)}</Badge>;
}

const complaintTones: Record<ComplaintStatus, Tone> = {
  open: "danger",
  in_progress: "warning",
  resolved: "success",
  closed: "neutral",
};

export function ComplaintBadge({ status }: { status: ComplaintStatus }) {
  return <Badge tone={complaintTones[status] ?? "neutral"}>{humanize(status)}</Badge>;
}

const paymentTones: Record<PaymentStatus, Tone> = {
  pending: "warning",
  completed: "success",
  failed: "danger",
  refunded: "info",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={paymentTones[status] ?? "neutral"}>{status}</Badge>;
}

// 'processing' is the gateway's in-flight state — neither success nor
// failure yet, so it takes the progress tone rather than borrowing warning
// (which everywhere else means "needs a human").
const withdrawalTones: Record<WithdrawalStatus, Tone> = {
  pending: "warning",
  processing: "progress",
  completed: "success",
  failed: "danger",
};

export function WithdrawalBadge({ status }: { status: WithdrawalStatus }) {
  return <Badge tone={withdrawalTones[status] ?? "neutral"}>{status}</Badge>;
}

const verificationTones: Record<VerificationStatus, Tone> = {
  approved: "success",
  rejected: "danger",
  pending: "warning",
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return <Badge tone={verificationTones[status] ?? "warning"}>{status}</Badge>;
}

export function UserStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={status === "suspended" ? "danger" : "success"}>{humanize(status)}</Badge>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "success" : "neutral"}>{active ? "Active" : "Inactive"}</Badge>;
}

/**
 * A rider's headline state. Suspension outranks presence — a suspended rider
 * who left the app open is not "on the road", so that case short-circuits
 * before is_online is considered.
 */
export function RiderStatusBadge({ status, online }: { status: string; online: boolean }) {
  if (status === "suspended") return <Badge tone="danger">Suspended</Badge>;
  return (
    <Badge tone={online ? "success" : "neutral"}>{online ? "On the road" : "Offline"}</Badge>
  );
}
