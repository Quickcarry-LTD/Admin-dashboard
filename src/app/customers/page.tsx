// ===============================================
// File: page.tsx (route: "/customers")
//
// Purpose:
// The Customers management page: a table of every customer with
// contact info, total orders, and join date. Maps to the "User
// Service" backend module (Customers / Profiles).
// ===============================================

import { Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { mockAllCustomers } from "@/constants/mockData";

export default function CustomersPage() {
  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="View customer accounts and order activity."
      />

      <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-border bg-surface px-3 py-2 mb-4">
        <Search size={15} className="text-text-tertiary" />
        <input
          type="text"
          placeholder="Search customers..."
          className="flex-1 text-sm outline-none placeholder:text-text-tertiary"
        />
      </div>

      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-secondary">
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Total Orders</th>
              <th className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {mockAllCustomers.map((c) => (
              <tr key={c.email} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-info-soft flex items-center justify-center text-info font-semibold text-xs">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-text-tertiary">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-text-secondary">{c.phone}</td>
                <td className="px-5 py-3">{c.totalOrders}</td>
                <td className="px-5 py-3 text-text-tertiary">{c.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
