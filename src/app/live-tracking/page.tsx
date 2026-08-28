// ===============================================
// File: page.tsx (route: "/live-tracking")
//
// Purpose:
// Full-screen live map showing every active rider's position in
// real time, plus a side list of active deliveries. Maps to the
// "WebSocket Gateway" and "Tracking Service" backend modules
// (Live Location / Route Tracking / ETA Updates / Geofencing).
//
// NOTE: The map here is a placeholder container ready for a real
// map library (Google Maps JS API / Mapbox GL) once an API key is
// available. Swap the placeholder div for the map component and
// subscribe to the WebSocket Gateway the same way the Customer/
// Rider apps' useDeliveryTracking hook does.
// ===============================================

import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { mockRecentOrders } from "@/constants/mockData";

export default function LiveTrackingPage() {
  const activeDeliveries = mockRecentOrders.filter((o) => o.status === "In Transit");

  return (
    <div>
      <PageHeader title="Live Tracking" subtitle="Real-time location of every active delivery." />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ---------- Map ---------- */}
        <div className="lg:col-span-3 rounded-xl bg-surface border border-border h-[600px] flex items-center justify-center text-text-secondary text-sm">
          Live map — connect a map provider (Google Maps / Mapbox) and the
          WebSocket Gateway to render real-time rider positions here.
        </div>

        {/* ---------- Active deliveries list ---------- */}
        <div className="rounded-xl bg-surface border border-border p-4">
          <h2 className="text-sm font-semibold mb-3">Active Deliveries</h2>
          <div className="space-y-3">
            {activeDeliveries.length === 0 && (
              <p className="text-xs text-text-tertiary">No deliveries in transit right now.</p>
            )}
            {activeDeliveries.map((order) => (
              <div key={order.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{order.id}</p>
                  <StatusPill status={order.status} />
                </div>
                <p className="text-xs text-text-secondary mt-1">{order.route}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
