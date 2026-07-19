import type { ReeferOemName, Trailer } from "@/lib/types/fleet";
import { isReeferTrailer } from "@/lib/types/fleet";

/**
 * Future hook point for Thermo King, Carrier Transicold, and telematics temp feeds.
 * No live API calls — structured for OEM / telematics adapters.
 */
export type ReeferDefrostStatus = "idle" | "active" | "pending";

export type ReeferAlarmSeverity = "info" | "warning" | "critical";

export type ReeferAlarm = {
  id: string;
  code: string;
  message: string;
  severity: ReeferAlarmSeverity;
  occurredAt: string;
  clearedAt?: string;
};

export type ReeferDoorEvent = {
  id: string;
  openedAt: string;
  closedAt?: string;
  durationMinutes?: number;
  location?: string;
};

export type ReeferTelemetrySnapshot = {
  provider: ReeferOemName;
  trailerId: string;
  connected: boolean;
  currentTempF: number;
  setTempF: number;
  returnTempF: number;
  fuelLevelPercent: number;
  engineHours: number;
  defrostStatus: ReeferDefrostStatus;
  alarms: ReeferAlarm[];
  doorEvents: ReeferDoorEvent[];
  recordedAt: string;
};

export interface ReeferProvider {
  readonly name: ReeferOemName;
  getTelemetry(trailer: Trailer): Promise<ReeferTelemetrySnapshot | null>;
}

function mockSeed(trailerId: string): number {
  let hash = 0;
  for (let i = 0; i < trailerId.length; i += 1) {
    hash = (hash * 31 + trailerId.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export const mockReeferProvider: ReeferProvider = {
  name: "mock",

  async getTelemetry(trailer) {
    if (!isReeferTrailer(trailer)) {
      return null;
    }

    const seed = mockSeed(trailer.id);
    const setTempF = trailer.reeferSetTempF ?? 34;
    const currentTempF =
      trailer.reeferCurrentTempF ?? setTempF + ((seed % 7) - 3) * 0.4;
    const fuelLevelPercent = trailer.reeferFuelLevelPercent ?? 40 + (seed % 45);
    const engineHours = trailer.reeferEngineHours ?? 3000 + (seed % 5000);
    const deviation = Math.abs(currentTempF - setTempF);
    const criticalFuel = fuelLevelPercent < 15;

    const alarms: ReeferAlarm[] = [];
    if (deviation >= 4) {
      alarms.push({
        id: `${trailer.id}-alarm-temp`,
        code: "TEMP_DEV",
        message: `Temperature deviation ${deviation.toFixed(1)}°F from set point`,
        severity: deviation >= 8 ? "critical" : "warning",
        occurredAt: "2026-07-17T10:12:00Z",
      });
    }
    if (criticalFuel) {
      alarms.push({
        id: `${trailer.id}-alarm-fuel`,
        code: "FUEL_LOW",
        message: `Reefer fuel low — ${fuelLevelPercent}% remaining`,
        severity: fuelLevelPercent < 10 ? "critical" : "warning",
        occurredAt: "2026-07-16T22:40:00Z",
      });
    }
    if (trailer.status === "out_of_service") {
      alarms.push({
        id: `${trailer.id}-alarm-unit`,
        code: "UNIT_OFF",
        message: "Reefer unit offline — unit out of service",
        severity: "critical",
        occurredAt: "2026-07-14T08:00:00Z",
      });
    }

    const doorEvents: ReeferDoorEvent[] = [
      {
        id: `${trailer.id}-door-1`,
        openedAt: "2026-07-16T14:20:00Z",
        closedAt: "2026-07-16T14:38:00Z",
        durationMinutes: 18,
        location: trailer.location ?? "Unknown",
      },
      {
        id: `${trailer.id}-door-2`,
        openedAt: "2026-07-15T09:05:00Z",
        closedAt: "2026-07-15T09:12:00Z",
        durationMinutes: 7,
        location: "Shipper dock",
      },
    ];

    return {
      provider: trailer.reeferOem ?? "mock",
      trailerId: trailer.id,
      connected: trailer.status !== "out_of_service",
      currentTempF: Math.round(currentTempF * 10) / 10,
      setTempF,
      returnTempF: Math.round((currentTempF + 1.2) * 10) / 10,
      fuelLevelPercent,
      engineHours,
      defrostStatus: seed % 5 === 0 ? "active" : "idle",
      alarms,
      doorEvents,
      recordedAt: new Date().toISOString(),
    };
  },
};

const providerRegistry: Record<ReeferOemName, ReeferProvider | null> = {
  mock: mockReeferProvider,
  thermo_king: null,
  carrier: null,
  telematics: null,
};

export function getReeferProvider(name: ReeferOemName = "mock"): ReeferProvider {
  return providerRegistry[name] ?? mockReeferProvider;
}

export async function getTrailerReeferTelemetry(
  trailer: Trailer,
): Promise<ReeferTelemetrySnapshot | null> {
  const provider = getReeferProvider(trailer.reeferOem ?? "mock");
  return provider.getTelemetry(trailer);
}
