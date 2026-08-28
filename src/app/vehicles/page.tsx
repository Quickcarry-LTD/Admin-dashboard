// ===============================================
// File: page.tsx (route: "/vehicles")
//
// Purpose:
// Registered vehicle records tied to riders (plate number, type,
// document verification status). Extends the "Rider Service"
// backend module's documents/verification data.
// ===============================================

import { PageHeader } from "@/components/PageHeader";
import { mockAllRiders } from "@/constants/mockData";

// Mock vehicle records derived from riders, standing in for a real
// GET /admin/vehicles endpoint.
const mockVehicles = mockAllRiders.map((rider, i) => ({
  plate: `LND-${100 + i}-KJA`,
  type: i % 2 === 0 ? "Motorcycle" : "Van",
  owner: rider.name,
  verified: i % 3 !== 0,
}));

export default function VehiclesPage() {
  return (
    <div>
      <PageHeader title="Vehicles" subtitle="Registered vehicles and document verification status." />

      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-secondary">
              <th className="px-5 py-3 font-medium">Plate Number</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Owner</th>
              <th className="px-5 py-3 font-medium">Verification</th>
            </tr>
          </thead>
          <tbody>
            {mockVehicles.map((v) => (
              <tr key={v.plate} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-5 py-3 font-medium">{v.plate}</td>
                <td className="px-5 py-3 text-text-secondary">{v.type}</td>
                <td className="px-5 py-3 text-text-secondary">{v.owner}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      v.verified ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
                    }`}
                  >
                    {v.verified ? "Verified" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
