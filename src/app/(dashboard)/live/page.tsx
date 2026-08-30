"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  MapPinIcon,
  SignalIcon,
  SignalSlashIcon,
} from "@heroicons/react/24/outline";
import Panel, { PageHeader } from "@/components/Panel";
import StatCard from "@/components/StatCard";
import Button from "@/components/Button";
import RecordList, { type Field } from "@/components/RecordList";
import { Badge } from "@/components/StatusBadge";
import { Alert, EmptyState, StatCardSkeleton, TableSkeleton } from "@/components/Feedback";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { count, relativeTime } from "@/lib/format";
import type { LiveRider } from "@/lib/types";

// Poll interval. Riders push location on movement, so anything faster than
// this mostly re-fetches identical rows; anything slower and the board stops
// feeling live.
const REFRESH_MS = 15_000;

const FIELDS: Field<LiveRider>[] = [
  {
    key: "rider",
    label: "Rider",
    card: false,
    render: (r) => (
      <Link href={`/riders/${r.id}`} className="font-medium text-primary-accent hover:underline">
        {r.full_name}
      </Link>
    ),
  },
  {
    key: "vehicle",
    label: "Vehicle",
    render: (r) => (
      <>
        <p className="text-foreground">{r.vehicle_type}</p>
        <p className="text-sm uppercase text-muted-foreground">{r.plate_number}</p>
      </>
    ),
  },
  {
    key: "position",
    label: "Position",
    cellClassName: "tnum text-secondary-foreground",
    render: (r) => `${r.lat?.toFixed(5) ?? "—"}, ${r.lng?.toFixed(5) ?? "—"}`,
  },
  {
    key: "jobs",
    label: "Active jobs",
    align: "right",
    cellClassName: "tnum",
    render: (r) =>
      r.active_jobs > 0 ? (
        <span className="font-medium text-foreground">{r.active_jobs}</span>
      ) : (
        <span className="text-muted-foreground">Idle</span>
      ),
  },
  {
    key: "seen",
    label: "Last fix",
    cellClassName: "text-secondary-foreground",
    render: (r) => (r.last_location_at ? relativeTime(r.last_location_at) : "—"),
  },
  {
    key: "signal",
    label: "Signal",
    card: false,
    render: (r) =>
      r.fresh ? <Badge tone="success">Live</Badge> : <Badge tone="warning">Stale</Badge>,
  },
];

export default function LivePage() {
  const [tick, setTick] = useState(0);
  const [auto, setAuto] = useState(true);

  const { data, error, loading, reload } = useAsync(() => api.liveRiders(), [tick]);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, [auto]);

  const riders = data?.riders ?? [];
  const staleMinutes = Math.round((data?.stale_after_seconds ?? 120) / 60);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Live fleet"
        description={`Every rider currently online with a position fix. A fix older than ${staleMinutes} minutes is marked stale — usually a backgrounded app or lost signal rather than a stopped rider.`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant={auto ? "primary" : "outline"}
              size="sm"
              onClick={() => setAuto((a) => !a)}
              aria-pressed={auto}
            >
              {auto ? <SignalIcon /> : <SignalSlashIcon />}
              {auto ? "Auto-refresh on" : "Auto-refresh off"}
            </Button>
            <Button variant="outline" size="sm" onClick={reload}>
              <ArrowPathIcon />
              Refresh
            </Button>
          </div>
        }
      />

      {error && <Alert>{error}</Alert>}

      <section className="grid gap-5 sm:grid-cols-3">
        {loading && !data ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Riders online"
              value={count(data?.online ?? 0)}
              sub="With a position fix"
              icon={SignalIcon}
              tone="brand"
            />
            <StatCard
              label="Reporting now"
              value={count(data?.fresh ?? 0)}
              sub={`Fix under ${staleMinutes} min old`}
              icon={MapPinIcon}
              tone="success"
            />
            <StatCard
              label="Carrying a job"
              value={count(riders.filter((r) => r.active_jobs > 0).length)}
              sub="Accepted, picked up or in transit"
              icon={ArrowPathIcon}
              tone="info"
            />
          </>
        )}
      </section>

      <Panel
        title="Rider positions"
        bodyClassName=""
        action={
          data && (
            <span className="text-sm text-secondary-foreground">
              Updated {relativeTime(data.generated_at)}
            </span>
          )
        }
      >
        {loading && !data ? (
          <TableSkeleton columns={6} />
        ) : riders.length === 0 ? (
          <EmptyState
            icon={SignalSlashIcon}
            title="No riders online"
            description="Positions appear here as riders go online and their app reports a fix."
          />
        ) : (
          <RecordList
            rows={riders}
            fields={FIELDS}
            getKey={(r) => String(r.id)}
            minWidth={900}
            href={(r) => `/riders/${r.id}`}
            cardTitle={(r) => r.full_name}
            cardSubtitle={(r) => `${r.vehicle_type} · ${r.plate_number}`}
            cardBadge={(r) =>
              r.fresh ? <Badge tone="success">Live</Badge> : <Badge tone="warning">Stale</Badge>
            }
          />
        )}
      </Panel>

      {/* No map tiles: rendering a fake map would be worse than saying plainly
          that coordinates are all the API provides today. */}
      <Panel title="Map view">
        <p className="text-base leading-relaxed text-secondary-foreground">
          Positions above are live coordinates. Plotting them on a map needs a
          tile provider key (Google Maps or Mapbox) in{" "}
          <code className="rounded bg-card-muted px-1.5 py-0.5 font-mono text-sm">
            NEXT_PUBLIC_MAPS_KEY
          </code>
          . Until one is set this page shows the raw fleet rather than a
          decorative placeholder.
        </p>
      </Panel>
    </>
  );
}
