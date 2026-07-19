"use client";

import PremiumStatusBadge from "@/components/premium/StatusBadge";
import { formatAdminWhen } from "@/components/admin/admin-format";
import { useAdminStore } from "@/hooks/useAdminStore";
import { setDeviceTrusted } from "@/lib/admin/store";
import { logAction } from "@/lib/permissions/audit";

type DeviceListProps = {
  onToast: (message: string) => void;
};

export default function DeviceList({ onToast }: DeviceListProps) {
  const store = useAdminStore();

  function toggleTrust(deviceId: string, next: boolean) {
    const device = setDeviceTrusted(deviceId, next);
    if (!device) return;
    logAction({
      action: next ? "trusted" : "untrusted",
      resource: "admin.device",
      resourceId: deviceId,
      details: `${next ? "Trusted" : "Untrusted"} device “${device.deviceLabel}” for ${device.userName}`,
    });
    onToast(
      next
        ? `Trusted ${device.deviceLabel}`
        : `Removed trust from ${device.deviceLabel}`,
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
          Device history
        </h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Browsers and devices that have accessed Transpo.ai.
        </p>
      </div>

      <div className="divide-y divide-[#F1F5F9] overflow-hidden rounded-[14px] bg-white ring-1 ring-[#EAEAEA]">
        {store.devices.map((device) => (
          <div
            key={device.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14px] font-semibold text-[#111827]">
                  {device.deviceLabel}
                </p>
                <PremiumStatusBadge
                  label={device.trusted ? "Trusted" : "Untrusted"}
                  tone={device.trusted ? "green" : "amber"}
                />
              </div>
              <p className="mt-0.5 text-[13px] text-[#6B7280]">
                {device.userName} · {device.browser} · {device.os}
              </p>
              <p className="mt-0.5 text-[13px] text-[#94A3B8]">
                {device.ip} · Last seen {formatAdminWhen(device.lastSeenAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleTrust(device.id, !device.trusted)}
              className="h-9 shrink-0 rounded-xl bg-[#F5F7FA] px-3 text-[13px] font-semibold text-[#111827] transition hover:bg-[#EEF2F7]"
            >
              {device.trusted ? "Remove trust" : "Trust device"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
