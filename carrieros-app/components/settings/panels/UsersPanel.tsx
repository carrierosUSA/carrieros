"use client";

import { useState } from "react";
import ActionTooltip from "@/components/ui/ActionTooltip";
import {
  SettingsField,
  SettingsPanelFrame,
  SettingsSaveButton,
  settingsInputClass,
  settingsSelectClass,
} from "@/components/settings/SettingsField";
import { BUILT_IN_ROLE_IDS, roleDisplayName } from "@/lib/permissions/roles";
import type { CarrierSettingsState, SettingsUser } from "@/lib/settings/types";

type UsersPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onUsersChange: (users: SettingsUser[]) => void;
  onSave: () => void;
};

export default function UsersPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onUsersChange,
  onSave,
}: UsersPanelProps) {
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("dispatcher");

  const canInvite =
    inviteName.trim().length > 1 &&
    inviteEmail.includes("@") &&
    inviteRole.length > 0;

  function invite() {
    if (!canInvite) return;
    const user: SettingsUser = {
      id: `user-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      title: "Team member",
      roleId: inviteRole,
      status: "invited",
      invitedAt: new Date().toISOString(),
    };
    onUsersChange([user, ...settings.users]);
    setInviteName("");
    setInviteEmail("");
  }

  return (
    <SettingsPanelFrame
      title="Users"
      description="Invite teammates and assign roles for day-to-day access."
      footer={
        <SettingsSaveButton
          onClick={onSave}
          disabled={!dirty}
          saving={saving}
          saved={savedFlash}
          disabledReason="No changes to save."
        />
      }
    >
      <div className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-950">Invite user</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <SettingsField label="Name">
            <input
              className={settingsInputClass}
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Full name"
            />
          </SettingsField>
          <SettingsField label="Email">
            <input
              className={settingsInputClass}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </SettingsField>
          <SettingsField label="Role">
            <select
              className={settingsSelectClass}
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              {BUILT_IN_ROLE_IDS.filter((id) => id !== "super_admin").map((id) => (
                <option key={id} value={id}>
                  {roleDisplayName(id)}
                </option>
              ))}
            </select>
          </SettingsField>
        </div>
        <div className="mt-3">
          <ActionTooltip
            label="Send invite"
            disabled={!canInvite}
            reason="Enter a name, valid email, and role to invite."
          >
            <button
              type="button"
              onClick={invite}
              disabled={!canInvite}
              className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Send invite
            </button>
          </ActionTooltip>
        </div>
      </div>

      <div className="space-y-2">
        {settings.users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-3 rounded-[14px] bg-white px-4 py-3.5 ring-1 ring-[#EAEAEA] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-semibold text-slate-950">
                  {user.name}
                </p>
                <StatusChip status={user.status} />
              </div>
              <p className="mt-0.5 text-[14px] text-slate-500">
                {user.email}
                {user.title ? ` · ${user.title}` : ""}
              </p>
            </div>
            <select
              className={`${settingsSelectClass} sm:w-[180px]`}
              value={user.roleId}
              onChange={(e) =>
                onUsersChange(
                  settings.users.map((u) =>
                    u.id === user.id ? { ...u, roleId: e.target.value } : u,
                  ),
                )
              }
              disabled={user.status === "disabled"}
            >
              {BUILT_IN_ROLE_IDS.map((id) => (
                <option key={id} value={id}>
                  {roleDisplayName(id)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </SettingsPanelFrame>
  );
}

function StatusChip({ status }: { status: SettingsUser["status"] }) {
  if (status === "active") {
    return (
      <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[12px] font-semibold text-[#15803D]">
        Active
      </span>
    );
  }
  if (status === "invited") {
    return (
      <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[12px] font-semibold text-[#C2410C]">
        Invited
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[12px] font-semibold text-slate-500">
      Disabled
    </span>
  );
}
