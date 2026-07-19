"use client";

import Link from "next/link";
import { SettingsPanelFrame } from "@/components/settings/SettingsField";
import { PAGE_PERMISSIONS } from "@/lib/permissions/permissions-catalog";
import {
  BUILT_IN_ROLE_IDS,
  getBuiltInRoles,
  roleDisplayName,
} from "@/lib/permissions/roles";

const MATRIX_ROLES = BUILT_IN_ROLE_IDS.filter((id) =>
  [
    "owner",
    "dispatcher",
    "accounting",
    "safety",
    "maintenance",
    "driver",
    "read_only",
  ].includes(id),
);

export default function PermissionsPanel() {
  const roles = getBuiltInRoles().filter((r) =>
    MATRIX_ROLES.includes(r.id as (typeof MATRIX_ROLES)[number]),
  );
  const pages = PAGE_PERMISSIONS.slice(0, 10);

  return (
    <SettingsPanelFrame
      title="Permissions"
      description="Role-based access for pages, actions, and documents — with a full audit trail."
    >
      <div className="rounded-[16px] bg-[#EFF6FF] px-4 py-3.5">
        <p className="text-[14px] font-medium text-[#1D4ED8]">
          Edit roles, assign users, and search the audit log in the enterprise
          permissions manager.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href="/settings/permissions"
            className="inline-flex text-[14px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Open roles & matrix →
          </Link>
          <Link
            href="/settings/permissions?tab=users"
            className="inline-flex text-[14px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            User assignments →
          </Link>
          <Link
            href="/settings/permissions?tab=audit"
            className="inline-flex text-[14px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Audit log →
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[16px] bg-[#F8FAFC] p-3 ring-1 ring-[#EAEAEA]">
        <table className="min-w-full border-separate border-spacing-y-1 text-left">
          <thead>
            <tr>
              <th className="px-3 py-2 text-[13px] font-medium text-slate-500">
                Page
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="px-2 py-2 text-center text-[12px] font-semibold text-slate-600"
                >
                  {roleDisplayName(role.id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="bg-white">
                <td className="rounded-l-[12px] px-3 py-2.5 text-[14px] font-medium text-slate-800">
                  {page.label}
                </td>
                {roles.map((role) => {
                  const allowed = role.permissionIds.includes(page.id);
                  return (
                    <td
                      key={`${role.id}-${page.id}`}
                      className="px-2 py-2.5 text-center last:rounded-r-[12px]"
                    >
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold ${
                          allowed
                            ? "bg-[#ECFDF5] text-[#15803D]"
                            : "bg-[#F1F5F9] text-slate-400"
                        }`}
                        title={allowed ? "Allowed" : "Denied"}
                      >
                        {allowed ? "✓" : "–"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsPanelFrame>
  );
}
