// ===============================================
// File: page.tsx (route: "/support")
//
// Purpose:
// Customer/rider support ticket queue. Maps to the "Admin
// Service" backend module (Complaints).
// ===============================================

import { PageHeader } from "@/components/PageHeader";

const mockTickets = [
  { id: "TCK-2201", from: "Mary Johnson", subject: "Rider arrived late", priority: "Medium", status: "Open" },
  { id: "TCK-2200", from: "Ibrahim Ali (Rider)", subject: "Payout not received", priority: "High", status: "Open" },
  { id: "TCK-2199", from: "Fatima Hassan", subject: "Package damaged on arrival", priority: "High", status: "In Progress" },
  { id: "TCK-2198", from: "Samuel Peter", subject: "App crashed during checkout", priority: "Low", status: "Resolved" },
];

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-danger-soft text-danger",
  Medium: "bg-warning-soft text-warning",
  Low: "bg-border text-text-secondary",
};

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-info-soft text-info",
  "In Progress": "bg-warning-soft text-warning",
  Resolved: "bg-success-soft text-success",
};

export default function SupportPage() {
  return (
    <div>
      <PageHeader title="Support Tickets" subtitle="Review and resolve customer and rider complaints." />

      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-secondary">
              <th className="px-5 py-3 font-medium">Ticket ID</th>
              <th className="px-5 py-3 font-medium">From</th>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockTickets.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-5 py-3 font-medium">{t.id}</td>
                <td className="px-5 py-3 text-text-secondary">{t.from}</td>
                <td className="px-5 py-3 text-text-secondary">{t.subject}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLES[t.priority]}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[t.status]}`}>
                    {t.status}
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
