// ===============================================
// File: page.tsx (route: "/wallet")
//
// Purpose:
// Platform-wide wallet & payments overview: total transaction
// volume, payment gateway status, and a transaction log. Maps to
// the "Wallet Service" and "Payment Service" backend modules.
// ===============================================

import { PageHeader } from "@/components/PageHeader";
import { formatCurrency } from "@/utils/formatCurrency";
import { mockRecentOrders } from "@/constants/mockData";

// Derived mock transactions from recent orders, standing in for a
// real GET /admin/transactions endpoint.
const mockTransactions = mockRecentOrders.map((o) => ({
  id: `TXN-${o.id.slice(-5)}`,
  orderId: o.id,
  amount: o.amount,
  method: "Wallet",
  status: o.status === "Cancelled" ? "Refunded" : "Successful",
  time: o.time,
}));

export default function WalletPage() {
  const totalVolume = mockTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <PageHeader title="Wallet & Payments" subtitle="Monitor platform-wide transactions and payouts." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-surface border border-border p-5">
          <p className="text-xs text-text-secondary mb-1">Total Transaction Volume</p>
          <p className="text-2xl font-bold">{formatCurrency(totalVolume)}</p>
        </div>
        <div className="rounded-xl bg-surface border border-border p-5">
          <p className="text-xs text-text-secondary mb-1">Payment Gateway</p>
          <p className="text-sm font-medium text-primary">Paystack / Flutterwave — Connected</p>
        </div>
        <div className="rounded-xl bg-surface border border-border p-5">
          <p className="text-xs text-text-secondary mb-1">Pending Payouts</p>
          <p className="text-2xl font-bold">₦0</p>
        </div>
      </div>

      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-secondary">
              <th className="px-5 py-3 font-medium">Transaction ID</th>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-5 py-3 font-medium">{t.id}</td>
                <td className="px-5 py-3 text-text-secondary">{t.orderId}</td>
                <td className="px-5 py-3 font-medium">{formatCurrency(t.amount)}</td>
                <td className="px-5 py-3 text-text-secondary">{t.method}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      t.status === "Refunded" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-text-tertiary">{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
