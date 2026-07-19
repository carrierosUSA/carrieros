"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import AuditLogTable from "@/components/permissions/AuditLogTable";
import CustomRoleForm from "@/components/permissions/CustomRoleForm";
import RolesMatrix from "@/components/permissions/RolesMatrix";
import UsersRolePanel from "@/components/permissions/UsersRolePanel";
import FadeIn from "@/components/ui/FadeIn";
import { logAction } from "@/lib/permissions/audit";
import {
  createCustomRole,
  deleteCustomRole,
  getPermissionsStore,
  listAllRoles,
  resetPermissionsStore,
  subscribePermissionsStore,
  updateRolePermissions,
} from "@/lib/permissions/store";
import type { PermissionId, RoleDefinition, RoleId } from "@/lib/permissions/types";

type TabId = "roles" | "users" | "audit";

const TABS: { id: TabId; label: string }[] = [
  { id: "roles", label: "Roles" },
  { id: "users", label: "Users" },
  { id: "audit", label: "Audit log" },
];

export default function PermissionsSettingsClient({
  initialTab = "roles",
}: {
  initialTab?: TabId;
}) {
  useSyncExternalStore(
    subscribePermissionsStore,
    getPermissionsStore,
    getPermissionsStore,
  );

  const roles = listAllRoles();
  const [tab, setTab] = useState<TabId>(initialTab);
  const [selectedRoleId, setSelectedRoleId] = useState<RoleId>(
    roles[0]?.id ?? "owner",
  );
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Set<PermissionId>>(new Set());
  const [savedFlash, setSavedFlash] = useState(false);

  const selectedRole: RoleDefinition | undefined = useMemo(
    () => roles.find((role) => role.id === selectedRoleId),
    [roles, selectedRoleId],
  );

  useEffect(() => {
    if (!selectedRole) return;
    setDraft(new Set(selectedRole.permissionIds));
  }, [selectedRole]);

  const dirty = useMemo(() => {
    if (!selectedRole) return false;
    if (draft.size !== selectedRole.permissionIds.length) return true;
    return selectedRole.permissionIds.some((id) => !draft.has(id));
  }, [draft, selectedRole]);

  function selectRole(roleId: RoleId) {
    setSelectedRoleId(roleId);
    setCreating(false);
  }

  function handleSave() {
    if (!selectedRole) return;
    updateRolePermissions(selectedRole.id, Array.from(draft));
    logAction({
      action: "edit",
      resource: "settings.roles",
      resourceId: String(selectedRole.id),
      details: `Updated permissions for ${selectedRole.name}`,
    });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  }

  function handleCreate(input: {
    name: string;
    description: string;
    permissionIds: PermissionId[];
    ssoGroupHint?: string;
  }) {
    const role = createCustomRole(input);
    logAction({
      action: "create",
      resource: "settings.roles",
      resourceId: role.id,
      details: `Created custom role ${role.name}`,
    });
    setCreating(false);
    setSelectedRoleId(role.id);
  }

  function handleDeleteCustom() {
    if (!selectedRole || selectedRole.builtIn) return;
    const ok = window.confirm(
      `Delete custom role “${selectedRole.name}”? Users on this role become Read Only.`,
    );
    if (!ok) return;
    deleteCustomRole(selectedRole.id);
    logAction({
      action: "delete",
      resource: "settings.roles",
      resourceId: String(selectedRole.id),
      details: `Deleted custom role ${selectedRole.name}`,
    });
    setSelectedRoleId("owner");
  }

  return (
    <FadeIn className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-[#2563EB]">
            Enterprise access
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#111827]">
            Permissions
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#6B7280]">
            Roles, page / action / document access, and a full audit trail.
            Ready for SSO group mapping when you connect an identity provider.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Reset roles, assignments, and audit seed to defaults?",
              )
            ) {
              resetPermissionsStore();
              setSelectedRoleId("owner");
              setCreating(false);
            }
          }}
          className="inline-flex h-9 items-center self-start rounded-xl bg-[#F8FAFC] px-3 text-[12px] font-semibold text-[#6B7280] ring-1 ring-[#EAEAEA] transition hover:bg-white hover:text-[#374151]"
        >
          Reset demo data
        </button>
      </div>

      <nav
        aria-label="Permissions sections"
        className="flex gap-1 overflow-x-auto rounded-[14px] bg-[#F8FAFC] p-1 ring-1 ring-[#EAEAEA]"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 rounded-[10px] px-3 py-2 text-[13px] font-semibold transition ${
                active
                  ? "bg-white text-[#111827] shadow-sm ring-1 ring-[#EAEAEA]"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {tab === "roles" ? (
        <div className="space-y-5">
          {creating ? (
            <div className="rounded-2xl bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
              <div className="mb-5">
                <h2 className="text-[17px] font-semibold text-[#111827]">
                  Create custom role
                </h2>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  Pick the pages, actions, and documents this role can use.
                </p>
              </div>
              <CustomRoleForm
                onCancel={() => setCreating(false)}
                onCreate={handleCreate}
              />
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
              <aside className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                    Roles
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                  >
                    + Custom
                  </button>
                </div>
                <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#EAEAEA]">
                  <div className="max-h-[520px] divide-y divide-[#F1F5F9] overflow-y-auto">
                    {roles.map((role) => {
                      const active = role.id === selectedRoleId;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => selectRole(role.id)}
                          className={`block w-full px-3.5 py-3 text-left transition ${
                            active
                              ? "bg-[#EFF6FF]"
                              : "hover:bg-[#F8FAFC]"
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-semibold text-[#111827]">
                              {role.name}
                            </span>
                            {!role.builtIn ? (
                              <span className="rounded-md bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
                                Custom
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-[12px] leading-4 text-[#6B7280]">
                            {role.permissionIds.length} permissions
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              <div className="rounded-2xl bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
                {selectedRole ? (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-[17px] font-semibold text-[#111827]">
                          {selectedRole.name}
                        </h2>
                        <p className="mt-1 max-w-xl text-[13px] leading-5 text-[#6B7280]">
                          {selectedRole.description}
                        </p>
                        {selectedRole.ssoGroupHint ? (
                          <p className="mt-2 text-[12px] text-[#9CA3AF]">
                            SSO group hint:{" "}
                            <span className="font-medium text-[#6B7280]">
                              {selectedRole.ssoGroupHint}
                            </span>
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {!selectedRole.builtIn ? (
                          <button
                            type="button"
                            onClick={handleDeleteCustom}
                            className="inline-flex h-9 items-center rounded-xl bg-[#FEF2F2] px-3 text-[12px] font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2]"
                          >
                            Delete role
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={!dirty}
                          onClick={handleSave}
                          className="inline-flex h-9 items-center rounded-xl bg-[#2563EB] px-3 text-[12px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {savedFlash ? "Saved" : "Save changes"}
                        </button>
                      </div>
                    </div>

                    <RolesMatrix
                      selected={draft}
                      onChange={setDraft}
                    />
                  </div>
                ) : (
                  <p className="text-[14px] text-[#6B7280]">
                    Select a role to edit permissions.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {tab === "users" ? (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
          <h2 className="mb-4 text-[17px] font-semibold text-[#111827]">
            User role assignment
          </h2>
          <UsersRolePanel />
        </div>
      ) : null}

      {tab === "audit" ? (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
          <div className="mb-5">
            <h2 className="text-[17px] font-semibold text-[#111827]">
              Audit log
            </h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Every privileged action is recorded with actor, role, resource,
              and optional IP.
            </p>
          </div>
          <AuditLogTable />
        </div>
      ) : null}
    </FadeIn>
  );
}
