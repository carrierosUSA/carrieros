"use client";

import { useSyncExternalStore } from "react";
import { AlertTriangle } from "lucide-react";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getMaintenanceMessage,
  isMaintenanceMode,
} from "@/lib/admin/maintenance";
import {
  getAdminStore,
  subscribeAdminStore,
} from "@/lib/admin/store";

export default function MaintenanceBanner() {
  useSyncExternalStore(subscribeAdminStore, getAdminStore, getAdminStore);
  const enabled = isMaintenanceMode();
  const message = getMaintenanceMessage();
  const session = getCurrentSession();
  const isAdmin =
    session.role === "owner" || session.role === "super_admin";

  if (!enabled || isAdmin) return null;

  return (
    <div
      className="border-b border-[#FED7AA] bg-[#FFF7ED] px-3 py-2.5 sm:px-4 lg:px-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-[#EA580C]"
          strokeWidth={2}
        />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#9A3412]">
            Maintenance in progress
          </p>
          <p className="mt-0.5 text-[13px] leading-5 text-[#C2410C]">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
