// ===============================================
// File: page.tsx (route: "/settings")
//
// Purpose:
// System-wide configuration: platform fees, notification
// preferences, and general settings. Maps to the "Admin Service"
// backend module (System Settings).
// ===============================================

import { PageHeader } from "@/components/PageHeader";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="System Settings" subtitle="Configure platform-wide fees and preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-surface border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Pricing</h2>
          <SettingRow label="Base fare (Small package)" value="₦1,500" />
          <SettingRow label="Base fare (Medium package)" value="₦2,500" />
          <SettingRow label="Base fare (Large package)" value="₦4,000" />
          <SettingRow label="Delivery protection fee" value="₦150" />
          <SettingRow label="Service fee" value="₦100" />
        </div>

        <div className="rounded-xl bg-surface border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Platform</h2>
          <SettingRow label="Auto-accept timeout (riders)" value="30 sec" />
          <SettingRow label="Max delivery radius" value="50 km" />
          <SettingRow label="Support contact email" value="support@quickcarry.com" />
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
