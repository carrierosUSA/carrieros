import type {
  IntegrationHealth,
  IntegrationHealthSummary,
  IntegrationRuntimeState,
  IntegrationStoreState,
} from "./types";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/** Summarize fleet-wide integration health for the Health panel. */
export function computeHealthSummary(
  connections: IntegrationStoreState["connections"],
): IntegrationHealthSummary {
  const list = Object.values(connections).filter((c) => !c.comingSoon);

  const connected = list.filter((c) => c.status === "connected").length;
  const disconnected = list.filter((c) => c.status === "disconnected").length;
  const error = list.filter((c) => c.status === "error").length;
  const pending = list.filter((c) => c.status === "pending").length;
  const enabled = list.filter((c) => c.enabled).length;

  const rates = list
    .map((c) => c.health.successRate)
    .filter((v): v is number => typeof v === "number");
  const latencies = list
    .map((c) => c.health.latencyMs)
    .filter((v): v is number => typeof v === "number");

  return {
    connected,
    disconnected,
    error,
    pending,
    enabled,
    avgSuccessRate: average(rates),
    avgLatencyMs: average(latencies),
  };
}

export function formatRelativeSync(iso: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Never";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function isHealthy(connection: IntegrationRuntimeState): boolean {
  if (connection.status === "error") return false;
  if (connection.status !== "connected") return false;
  if (
    connection.health.successRate !== null &&
    connection.health.successRate < 90
  ) {
    return false;
  }
  return true;
}

export function emptyHealth(): IntegrationHealth {
  return {
    lastSyncAt: null,
    latencyMs: null,
    successRate: null,
    sparkline: [],
  };
}
