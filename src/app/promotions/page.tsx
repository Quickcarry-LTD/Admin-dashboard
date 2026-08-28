// ===============================================
// File: page.tsx (route: "/promotions")
//
// Purpose:
// Manage discount codes and delivery fee promotions offered to
// customers. Maps to the "Pricing Engine" backend module
// (surge/discount logic lives server-side; this page manages the
// promo records that feed into it).
// ===============================================

import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const mockPromotions = [
  { code: "WELCOME10", discount: "10% off", usage: "342 / 1000", expires: "Jun 30, 2025", active: true },
  { code: "WEEKEND500", discount: "₦500 off", usage: "128 / 500", expires: "May 31, 2025", active: true },
  { code: "RAMADAN25", discount: "25% off", usage: "890 / 900", expires: "Apr 20, 2025", active: false },
];

export default function PromotionsPage() {
  return (
    <div>
      <PageHeader
        title="Promotions"
        subtitle="Create and manage discount codes for customers."
        action={
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark transition-colors">
            <PlusCircle size={15} />
            New Promotion
          </button>
        }
      />

      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-secondary">
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Discount</th>
              <th className="px-5 py-3 font-medium">Usage</th>
              <th className="px-5 py-3 font-medium">Expires</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockPromotions.map((p) => (
              <tr key={p.code} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-5 py-3 font-medium">{p.code}</td>
                <td className="px-5 py-3 text-text-secondary">{p.discount}</td>
                <td className="px-5 py-3 text-text-secondary">{p.usage}</td>
                <td className="px-5 py-3 text-text-tertiary">{p.expires}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.active ? "bg-success-soft text-success" : "bg-border text-text-secondary"
                    }`}
                  >
                    {p.active ? "Active" : "Expired"}
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
