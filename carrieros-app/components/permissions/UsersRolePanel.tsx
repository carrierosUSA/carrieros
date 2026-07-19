"use client";

import { useSyncExternalStore } from "react";
import { logAction } from "@/lib/permissions/audit";
import { roleDisplayName } from "@/lib/permissions/roles";
import {
  DEMO_USERS,
  getAssignmentForUser,
  getPermissionsStore,
  listAllRoles,
  setUserRole,
  subscribePermissionsStore,
} from "@/lib/permissions/store";
import type { RoleId } from "@/lib/permissions/types";

export default function UsersRolePanel() {
  useSyncExternalStore(
    subscribePermissionsStore,
    getPermissionsStore,
    getPermissionsStore,
  );
  const roles = listAllRoles();

  function handleAssign(userId: string, roleId: RoleId, userName: string) {
    setUserRole(userId, roleId);
    logAction({
      action: "manage",
      resource: "settings.users",
      details: `Assigned ${userName} to ${roleDisplayName(roleId)}`,
      resourceId: userId,
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-[14px] leading-6 text-[#6B7280]">
        Demo users for role assignment. Changing a role updates the permission
        matrix used by <span className="font-medium text-[#374151]">can()</span>{" "}
        for that user id. The active session remains Alpha Owner unless you
        assign that user a different role.
      </p>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#EAEAEA]">
        <div className="divide-y divide-[#F1F5F9]">
          {DEMO_USERS.map((user) => {
            const roleId = getAssignmentForUser(user.id);
            return (
              <div
                key={user.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#111827]">
                    {user.name}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6B7280]">
                    {user.title} · {user.email}
                  </p>
                </div>
                <label className="block w-full space-y-1 sm:w-56">
                  <span className="sr-only">Role for {user.name}</span>
                  <select
                    value={roleId}
                    onChange={(e) =>
                      handleAssign(user.id, e.target.value as RoleId, user.name)
                    }
                    className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 text-[13px] font-semibold text-[#111827] outline-none ring-[#2563EB] focus:bg-white focus:ring-2"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                        {role.builtIn ? "" : " (custom)"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
