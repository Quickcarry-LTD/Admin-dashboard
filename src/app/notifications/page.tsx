// ===============================================
// File: page.tsx (route: "/notifications")
//
// Purpose:
// Compose and review platform notifications sent to customers/
// riders. Maps to the "Notification Service" backend module
// (Push / SMS / Email / In-App).
// ===============================================

import { Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const mockSentNotifications = [
  { title: "Weekend Delivery Promo", audience: "All Customers", sentAt: "Today, 09:00 AM", channel: "Push" },
  { title: "New Rider Bonus Program", audience: "All Riders", sentAt: "Yesterday, 03:30 PM", channel: "SMS" },
  { title: "Scheduled Maintenance Notice", audience: "All Users", sentAt: "2 days ago", channel: "Email" },
];

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader title="Notifications" subtitle="Send announcements and review notification history." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ---------- Compose form ---------- */}
        <div className="rounded-xl bg-surface border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Send Notification</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none"
            />
            <textarea
              placeholder="Message"
              rows={4}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none resize-none"
            />
            <select className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none">
              <option>All Customers</option>
              <option>All Riders</option>
              <option>All Users</option>
            </select>
            <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm text-white hover:bg-primary-dark transition-colors">
              <Send size={15} />
              Send Notification
            </button>
          </div>
        </div>

        {/* ---------- History ---------- */}
        <div className="lg:col-span-2 rounded-xl bg-surface border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Recent Notifications</h2>
          <div className="space-y-3">
            {mockSentNotifications.map((n) => (
              <div key={n.title} className="border-b border-border last:border-0 pb-3 last:pb-0">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{n.title}</p>
                  <span className="text-xs text-text-tertiary">{n.channel}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {n.audience} • {n.sentAt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
