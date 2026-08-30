"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import Panel, { PageHeader } from "@/components/Panel";
import Button from "@/components/Button";
import { Input } from "@/components/Field";
import { Alert, LoadingBlock, Spinner } from "@/components/Feedback";
import { api } from "@/lib/api";
import { errorMessage, useAsync } from "@/lib/useAsync";
import { formatDateTime } from "@/lib/format";
import {
  PAYMENT_GATEWAYS,
  type PaymentGateway,
  type Settings,
  type SettingsInput,
} from "@/lib/types";

// Every numeric field on updateSettingsRequest is `required,gt=0`, and the
// handler writes the whole row — so this is a full-object write wearing
// PATCH's clothing. The form is seeded from the current settings and always
// submits all seventeen fields; a partial payload fails validation rather
// than merging.
const NUMERIC_FIELDS: {
  key: keyof Omit<SettingsInput, "active_payment_gateway">;
  label: string;
  hint?: string;
  group: "delivery" | "ride" | "hire" | "platform" | "area";
}[] = [
  { key: "base_fare", label: "Base fare", hint: "₦", group: "delivery" },
  { key: "per_km_rate", label: "Per km", hint: "₦", group: "delivery" },
  { key: "per_min_rate", label: "Per minute", hint: "₦", group: "delivery" },

  { key: "ride_base_fare", label: "Ride base fare", hint: "₦", group: "ride" },
  { key: "ride_per_km_rate", label: "Ride per km", hint: "₦", group: "ride" },
  { key: "ride_per_min_rate", label: "Ride per minute", hint: "₦", group: "ride" },

  { key: "hire_base_fare", label: "Hire base fare", hint: "₦", group: "hire" },
  { key: "hire_hourly_rate", label: "Hire hourly rate", hint: "₦", group: "hire" },

  { key: "commission_percent", label: "Delivery commission", hint: "%", group: "platform" },
  {
    key: "marketplace_commission_percent",
    label: "Marketplace commission",
    hint: "%",
    group: "platform",
  },
  { key: "free_daily_pickups", label: "Free daily pickups", group: "platform" },
  {
    key: "standard_subscription_fee",
    label: "Standard rider subscription",
    hint: "₦",
    group: "platform",
  },
  {
    key: "premium_subscription_fee",
    label: "Premium rider subscription",
    hint: "₦",
    group: "platform",
  },

  { key: "service_area_lat", label: "Centre latitude", group: "area" },
  { key: "service_area_lng", label: "Centre longitude", group: "area" },
  { key: "service_area_radius_km", label: "Radius", hint: "km", group: "area" },
];

const GROUPS: { id: (typeof NUMERIC_FIELDS)[number]["group"]; title: string; blurb: string }[] = [
  {
    id: "delivery",
    title: "Delivery pricing",
    blurb: "What the pricing engine charges for a package run.",
  },
  { id: "ride", title: "Ride pricing", blurb: "Passenger trips, priced separately." },
  { id: "hire", title: "Hire pricing", blurb: "Vehicle-and-rider hire by the hour." },
  {
    id: "platform",
    title: "Platform economics",
    blurb: "Commission splits and rider subscription fees.",
  },
  {
    id: "area",
    title: "Service area",
    blurb: "Bookings outside this circle are refused.",
  },
];

type FormValues = Record<string, string>;

function toForm(settings: Settings): FormValues {
  const values: FormValues = {};
  for (const { key } of NUMERIC_FIELDS) values[key] = String(settings[key]);
  return values;
}

export default function SettingsPage() {
  const { data, error, loading, reload } = useAsync(() => api.getSettings(), []);

  const [values, setValues] = useState<FormValues | null>(null);
  const [gateway, setGateway] = useState<PaymentGateway | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  // Seed the editable copy from the loaded settings on first render after
  // they arrive, without an effect: `values === null` means "not seeded
  // yet", and the loaded data is available right here during render.
  const settings = data;
  if (settings && values === null) {
    setValues(toForm(settings));
    setGateway(settings.active_payment_gateway);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values || !gateway) return;

    const payload: Record<string, number | string> = {
      active_payment_gateway: gateway,
    };
    for (const { key, label } of NUMERIC_FIELDS) {
      const parsed = Number(values[key]);
      if (!Number.isFinite(parsed)) {
        setSaveError(`${label} must be a number.`);
        return;
      }
      // Latitude and longitude are the only fields the API does not require
      // to be > 0 — everything else is rejected server-side at zero, so it
      // is worth saying so before the round trip.
      const allowsZeroOrNegative =
        key === "service_area_lat" || key === "service_area_lng";
      if (!allowsZeroOrNegative && parsed <= 0) {
        setSaveError(`${label} must be greater than zero.`);
        return;
      }
      payload[key] = parsed;
    }

    setSaveError("");
    setNotice("");
    setSaving(true);
    try {
      await api.updateSettings(payload as unknown as SettingsInput);
      setNotice("Settings saved. New fares use these rates immediately.");
      reload();
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Settings"
        description="The numbers every fare on QuickCarry is built from. Saving writes all of them at once — the API takes the whole object, not a patch."
      />

      {error && <Alert>{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      {loading ? (
        <LoadingBlock label="Loading settings" />
      ) : values && settings ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {GROUPS.map((group) => (
            <Panel key={group.id} title={group.title}>
              <p className="text-sm text-secondary-foreground">{group.blurb}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {NUMERIC_FIELDS.filter((f) => f.group === group.id).map((field) => (
                  <Input
                    key={field.key}
                    id={field.key}
                    label={field.label}
                    hint={field.hint}
                    inputMode="decimal"
                    className="tnum font-mono"
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [field.key]: e.target.value })
                    }
                  />
                ))}
              </div>
            </Panel>
          ))}

          <Panel title="Payment gateway">
            <p className="text-sm text-secondary-foreground">
              Which processor handles top-ups and payouts. Setting this to{" "}
              <span className="font-bold text-foreground">none</span> makes rider
              subscriptions activate without a checkout hand-off.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PAYMENT_GATEWAYS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={gateway === option}
                  onClick={() => setGateway(option)}
                  className={`flex items-center justify-center gap-2 border border-border px-3 py-3 text-sm transition-transform hover:-translate-y-0.5 ${
                    gateway === option ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                  }`}
                >
                  {gateway === option && <CheckIcon className="h-4 w-4" />}
                  {option}
                </button>
              ))}
            </div>
          </Panel>

          {saveError && <Alert>{saveError}</Alert>}

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving && <Spinner className="h-4 w-4 border-cream border-t-transparent" />}
              {saving ? "Saving" : "Save settings"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Last updated {formatDateTime(settings.updated_at)}
            </p>
          </div>
        </form>
      ) : null}
    </>
  );
}
