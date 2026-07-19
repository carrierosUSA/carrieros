import { getAdminStore } from "./store";
import type { HealthStatus, SystemHealthSnapshot } from "./types";

export function getSystemHealth(): SystemHealthSnapshot {
  return getAdminStore().health;
}

export function healthTone(
  status: HealthStatus,
): "green" | "amber" | "red" | "slate" {
  switch (status) {
    case "healthy":
      return "green";
    case "degraded":
      return "amber";
    case "down":
      return "red";
    default:
      return "slate";
  }
}

export function healthLabel(status: HealthStatus): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "degraded":
      return "Degraded";
    case "down":
      return "Down";
    default:
      return status;
  }
}

export function formatUptime(iso: string): string {
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return "—";
  const days = Math.floor((Date.now() - start) / 86_400_000);
  if (days < 1) return "Less than a day";
  if (days === 1) return "1 day";
  return `${days} days`;
}
