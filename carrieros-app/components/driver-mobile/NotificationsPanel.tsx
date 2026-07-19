"use client";

import { useEffect } from "react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import { BottomSheet, StatusChip } from "@/components/driver-mobile/ui";

const KIND_LABEL: Record<string, string> = {
  new_load: "New load",
  load_change: "Load change",
  appointment_change: "Appointment",
  document_request: "Documents",
  payroll_update: "Payroll",
  safety_alert: "Safety",
  maintenance_alert: "Maintenance",
};

export default function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { state, markAlertsRead } = useDriverMobile();

  useEffect(() => {
    markAlertsRead();
  }, [markAlertsRead]);

  return (
    <BottomSheet title="Notifications" onClose={onClose}>
      <div className="max-h-[60vh] space-y-2 overflow-y-auto pb-2">
        {state.alerts.map((alert) => (
          <div
            key={alert.id}
            className="rounded-2xl bg-[var(--dm-elevated)] px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[15px] font-semibold">{alert.title}</p>
              <StatusChip
                label={KIND_LABEL[alert.kind] ?? alert.kind}
                tone={alert.read ? "muted" : "warning"}
              />
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--dm-muted)]">
              {alert.body}
            </p>
            <p className="mt-2 text-[11px] text-[var(--dm-muted)]">
              {new Date(alert.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
