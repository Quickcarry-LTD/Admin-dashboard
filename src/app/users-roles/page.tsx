// ===============================================
// File: page.tsx (route: "/users-roles")
//
// Purpose:
// Manage admin team members and their role-based permissions
// (Super Admin, Support Agent, Finance, etc). Distinct from the
// Customers/Riders pages — this is internal QuickCarry staff access.
// ===============================================

import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const mockAdminUsers = [
  { name: "Admin", email: "admin@quickcarry.com", role: "Super Admin" },
  { name: "Halima Bello", email: "halima.bello@quickcarry.com", role: "Support Agent" },
  { name: "Tunde Alabi", email: "tunde.alabi@quickcarry.com", role: "Finance" },
  { name: "Grace Okon", email: "grace.okon@quickcarry.com", role: "Operations" },
];

export default function UsersRolesPage() {
  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle="Manage admin team access and permissions."
        action={
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark transition-colors">
            <UserPlus size={15} />
            Invite User
          </button>
        }
      />

      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-secondary">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAdminUsers.map((u) => (
              <tr key={u.email} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-text-secondary">{u.email}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-light text-primary">
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="text-primary text-xs font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
