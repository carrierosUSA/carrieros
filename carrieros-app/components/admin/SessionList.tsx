"use client";

import ActionTooltip from "@/components/ui/ActionTooltip";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import { formatAdminWhen } from "@/components/admin/admin-format";
import { useAdminStore } from "@/hooks/useAdminStore";
import { revokeSession } from "@/lib/admin/store";
import { logAction } from "@/lib/permissions/audit";

type SessionListProps = {
  onToast: (message: string) => void;
};

export default function SessionList({ onToast }: SessionListProps) {
  const store = useAdminStore();

  function handleRevoke(sessionId: string, label: string) {
    const revoked = revokeSession(sessionId);
    if (!revoked) {
      onToast("This session can’t be revoked.");
      return;
    }
    logAction({
      action: "revoked",
      resource: "admin.session",
      resourceId: sessionId,
      details: `Revoked session for ${revoked.userName} (${label})`,
    });
    onToast(`Session revoked for ${revoked.userName}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
          Session management
        </h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Active sign-ins across the workspace. Revoke anything that looks off.
        </p>
      </div>

      <div className="divide-y divide-[#F1F5F9] overflow-hidden rounded-[14px] bg-white ring-1 ring-[#EAEAEA]">
        {store.sessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14px] font-semibold text-[#111827]">
                  {session.userName}
                </p>
                {session.current ? (
                  <PremiumStatusBadge label="This device" tone="blue" />
                ) : null}
              </div>
              <p className="mt-0.5 text-[13px] text-[#6B7280]">
                {session.role} · {session.deviceLabel}
              </p>
              <p className="mt-0.5 text-[13px] text-[#94A3B8]">
                {session.ip} · {session.location} · Active{" "}
                {formatAdminWhen(session.lastActiveAt)}
              </p>
            </div>
            {session.current ? (
              <ActionTooltip
                label="Current session"
                reason="You’re signed in on this device."
                disabled
              >
                <button
                  type="button"
                  disabled
                  className="h-9 shrink-0 cursor-not-allowed rounded-xl bg-[#F1F5F9] px-3 text-[13px] font-semibold text-[#94A3B8]"
                >
                  Current
                </button>
              </ActionTooltip>
            ) : (
              <button
                type="button"
                onClick={() => handleRevoke(session.id, session.deviceLabel)}
                className="h-9 shrink-0 rounded-xl bg-[#FEF2F2] px-3 text-[13px] font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2]"
              >
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
