// ===============================================
// File: StatusPill.tsx
//
// Purpose:
// Colored status badge used across Orders, Riders, and Dashboard
// tables (Delivered / In Transit / Pending / Cancelled / Online /
// Offline), matching the pill styling in the Figma.
// ===============================================

const STATUS_STYLES: Record<string, string> = {
  Delivered: "bg-success-soft text-success",
  Completed: "bg-success-soft text-success",
  Online: "bg-success-soft text-success",
  "In Transit": "bg-info-soft text-info",
  Pending: "bg-warning-soft text-warning",
  Cancelled: "bg-danger-soft text-danger",
  Canceled: "bg-danger-soft text-danger",
  Offline: "bg-border text-text-secondary",
};

export function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-border text-text-secondary";
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
