import type {
  Trailer,
  TrailerDocument,
  TrailerPmItem,
  TrailerTirePosition,
  TrailerTimelineEvent,
} from "@/lib/types/fleet";
import { isReeferTrailer } from "@/lib/types/fleet";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

/** Structured placeholder detail data until document / tire services exist. */
export function buildTrailerDocuments(trailer: Trailer): TrailerDocument[] {
  const base = `${trailer.id}-doc`;
  const docs: TrailerDocument[] = [
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-reg`,
      trailerId: trailer.id,
      type: "registration",
      name: `Registration · Unit ${trailer.unitNumber}`,
      status: "valid",
      uploadedAt: "2026-01-18",
      expiresAt: "2026-12-31",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-ins`,
      trailerId: trailer.id,
      type: "insurance",
      name: "Trailer Physical Damage Policy",
      status: trailer.status === "out_of_service" ? "expiring" : "valid",
      uploadedAt: "2026-02-01",
      expiresAt: "2026-09-01",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-annual`,
      trailerId: trailer.id,
      type: "annual_inspection",
      name: "Annual DOT Inspection",
      status: (trailer.mileage ?? 0) > 250_000 ? "expiring" : "valid",
      uploadedAt: "2025-12-05",
      expiresAt: "2026-12-05",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-warr`,
      trailerId: trailer.id,
      type: "warranty",
      name: "Chassis Warranty",
      status: (trailer.year ?? 2020) >= 2022 ? "valid" : "expired",
      uploadedAt: "2022-06-01",
      expiresAt: (trailer.year ?? 2020) >= 2022 ? "2027-06-01" : "2025-06-01",
    },
  ];

  if (isReeferTrailer(trailer)) {
    docs.push({
      tenantId: DEMO_TENANT_ID,
      id: `${base}-reefer`,
      trailerId: trailer.id,
      type: "reefer_inspection",
      name: "Reefer Unit Inspection",
      status: trailer.reeferFuelLevelPercent !== undefined && trailer.reeferFuelLevelPercent < 15
        ? "expiring"
        : "valid",
      uploadedAt: "2026-05-10",
      expiresAt: "2026-11-10",
    });
  }

  return docs;
}

export function buildTrailerPmSchedule(trailer: Trailer): TrailerPmItem[] {
  const mileage = trailer.mileage ?? 100_000;
  return [
    {
      id: `${trailer.id}-pm`,
      trailerId: trailer.id,
      category: "pm_schedule",
      label: "A-Service trailer PM",
      dueDate: "2026-08-10",
      status: "due_soon",
      notes: "Brakes, lights, seals, suspension walk-around",
    },
    {
      id: `${trailer.id}-brakes`,
      trailerId: trailer.id,
      category: "brake_inspection",
      label: "Brake stroke inspection",
      dueDate: "2026-07-28",
      status: trailer.status === "in_shop" ? "overdue" : "scheduled",
    },
    {
      id: `${trailer.id}-tires`,
      trailerId: trailer.id,
      category: "tire_inspection",
      label: "Tire depth & pressure",
      dueMileage: mileage + 8_000,
      status: mileage % 100_000 > 85_000 ? "due_soon" : "ok",
    },
    {
      id: `${trailer.id}-seals`,
      trailerId: trailer.id,
      category: "wheel_seals",
      label: "Wheel seal inspection",
      dueDate: "2026-09-01",
      status: "ok",
    },
    {
      id: `${trailer.id}-lights`,
      trailerId: trailer.id,
      category: "lights",
      label: "Lighting circuit check",
      dueDate: "2026-08-20",
      status: "ok",
    },
    {
      id: `${trailer.id}-abs`,
      trailerId: trailer.id,
      category: "abs",
      label: "ABS diagnostic",
      dueDate: "2026-09-15",
      status: "ok",
    },
    {
      id: `${trailer.id}-susp`,
      trailerId: trailer.id,
      category: "suspension",
      label: "Air ride / spring check",
      dueMileage: mileage + 20_000,
      status: "ok",
    },
    {
      id: `${trailer.id}-repairs`,
      trailerId: trailer.id,
      category: "repairs",
      label: "Open repairs",
      status: trailer.status === "in_shop" || trailer.status === "out_of_service"
        ? "overdue"
        : "ok",
      notes:
        trailer.status === "in_shop"
          ? "Open work order in shop"
          : trailer.status === "out_of_service"
            ? "Unit out of service — see history"
            : "None open",
    },
    {
      id: `${trailer.id}-history`,
      trailerId: trailer.id,
      category: "service_history",
      label: "Last completed service",
      dueDate: trailer.lastServiceDate,
      status: "ok",
      notes: trailer.lastServiceDate
        ? `Completed ${trailer.lastServiceDate}`
        : "No service on file",
    },
  ];
}

export function buildTrailerTires(trailer: Trailer): TrailerTirePosition[] {
  const mileage = trailer.mileage ?? 100_000;
  const wear = mileage % 100_000;
  const baseTread = wear > 80_000 ? 3.2 : wear > 50_000 ? 5.5 : 8.0;

  const positions = [
    "Axle 1 Left Outer",
    "Axle 1 Left Inner",
    "Axle 1 Right Inner",
    "Axle 1 Right Outer",
    "Axle 2 Left Outer",
    "Axle 2 Left Inner",
    "Axle 2 Right Inner",
    "Axle 2 Right Outer",
  ];

  return positions.map((position, index) => {
    const tread = Math.max(2.0, baseTread - index * 0.15);
    const psi = 95 + (index % 4) * 2;
    const status =
      tread < 3.5 ? "replace" : tread < 5.0 ? "watch" : "ok";

    return {
      id: `${trailer.id}-tire-${index}`,
      trailerId: trailer.id,
      position,
      treadDepthMm: Math.round(tread * 10) / 10,
      psi,
      status,
      installedAt: "2025-09-12",
    };
  });
}

export function buildTrailerTimeline(trailer: Trailer): TrailerTimelineEvent[] {
  const events: TrailerTimelineEvent[] = [
    {
      id: `${trailer.id}-tl-1`,
      trailerId: trailer.id,
      label: `Status set to ${trailer.status.replaceAll("_", " ")}`,
      category: "status",
      occurredAt: "2026-07-16T14:00:00Z",
    },
    {
      id: `${trailer.id}-tl-2`,
      trailerId: trailer.id,
      label: trailer.truckId
        ? "Assigned to power unit"
        : "Unassigned from power unit",
      category: "assignment",
      occurredAt: "2026-07-10T09:30:00Z",
    },
    {
      id: `${trailer.id}-tl-3`,
      trailerId: trailer.id,
      label: trailer.lastServiceDate
        ? `Service completed (${trailer.lastServiceDate})`
        : "Maintenance note added",
      category: "maintenance",
      occurredAt: `${trailer.lastServiceDate ?? "2026-05-15"}T12:00:00Z`,
    },
    {
      id: `${trailer.id}-tl-4`,
      trailerId: trailer.id,
      label: "Registration document uploaded",
      category: "document",
      occurredAt: "2026-01-18T11:00:00Z",
    },
    {
      id: `${trailer.id}-tl-5`,
      trailerId: trailer.id,
      label: `${(trailer.telematicsProvider ?? "mock").toUpperCase()} GPS linked`,
      category: "telematics",
      occurredAt: "2025-11-01T08:00:00Z",
    },
  ];

  if (isReeferTrailer(trailer)) {
    events.splice(2, 0, {
      id: `${trailer.id}-tl-reefer`,
      trailerId: trailer.id,
      label: `${(trailer.reeferOem ?? "mock").replaceAll("_", " ")} reefer telemetry linked`,
      category: "reefer",
      occurredAt: "2026-02-01T10:00:00Z",
    });
  }

  return events;
}
