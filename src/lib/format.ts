// The API is Abuja-based and prices everything in naira; amounts arrive as
// plain numbers (DECIMAL parsed server-side), never as minor units.
const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactNaira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function money(value: number) {
  return naira.format(value ?? 0);
}

// For stat tiles, where ₦1,240,500.00 would blow out the column.
export function moneyCompact(value: number) {
  return compactNaira.format(value ?? 0);
}

export function count(value: number) {
  return new Intl.NumberFormat("en-NG").format(value ?? 0);
}

const dateTime = new Intl.DateTimeFormat("en-NG", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateOnly = new Intl.DateTimeFormat("en-NG", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateTime.format(d);
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateOnly.format(d);
}

// A coupon expiry is a calendar date, not an instant. It is sent as
// "<picked-date>T23:59:59Z", so formatting it in local time shifts it a day
// forward anywhere east of UTC — pick 31 Dec in Lagos (UTC+1) and the table
// reads 01 Jan. Formatting in UTC makes it round-trip to the day chosen.
const calendarDate = new Intl.DateTimeFormat("en-NG", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatCalendarDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : calendarDate.format(d);
}

export function relativeTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const seconds = Math.round((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return dateOnly.format(d);
}

export function titleCase(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

// Delivery, complaint and payment statuses arrive as the DB's snake_case
// enum values ("in_transit", "in_progress"). Badges render them uppercase
// so the underscore has to go, but the raw value is still what gets sent
// back to the API — this is display only.
export function humanize(value: string) {
  return value.replace(/_/g, " ");
}

// The analytics endpoint keys its series by "2006-01-02" date strings.
// Charts want a short weekday, not the ISO string.
const weekday = new Intl.DateTimeFormat("en-NG", { weekday: "short" });

export function shortDay(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(d.getTime()) ? isoDate : weekday.format(d);
}
