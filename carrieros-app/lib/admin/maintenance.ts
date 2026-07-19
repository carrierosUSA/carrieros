import { logAction } from "@/lib/permissions/audit";
import { getAdminStore, updateAdminStore } from "./store";
import { DEFAULT_MAINTENANCE_MESSAGE } from "./types";

export function isMaintenanceMode(): boolean {
  return getAdminStore().maintenanceMode;
}

export function getMaintenanceMessage(): string {
  return getAdminStore().maintenanceMessage || DEFAULT_MAINTENANCE_MESSAGE;
}

export function setMaintenanceMode(
  enabled: boolean,
  message?: string,
): { maintenanceMode: boolean; maintenanceMessage: string } {
  const maintenanceMessage =
    message?.trim() ||
    getAdminStore().maintenanceMessage ||
    DEFAULT_MAINTENANCE_MESSAGE;

  updateAdminStore((prev) => ({
    ...prev,
    maintenanceMode: enabled,
    maintenanceMessage,
  }));

  logAction({
    action: enabled ? "enabled" : "disabled",
    resource: "admin.maintenance",
    details: enabled
      ? `Enabled maintenance mode — ${maintenanceMessage}`
      : "Disabled maintenance mode",
  });

  return {
    maintenanceMode: enabled,
    maintenanceMessage,
  };
}

export function setMaintenanceMessage(message: string): string {
  const next = message.trim() || DEFAULT_MAINTENANCE_MESSAGE;
  updateAdminStore((prev) => ({
    ...prev,
    maintenanceMessage: next,
  }));
  return next;
}
