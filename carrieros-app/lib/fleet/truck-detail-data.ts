import type {
  Truck,
  TruckCameraChannel,
  TruckDocument,
  TruckExpense,
  TruckPmItem,
  TruckTimelineEvent,
} from "@/lib/types/fleet";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

/** Structured placeholder detail data until document / expense services exist. */
export function buildTruckDocuments(truck: Truck): TruckDocument[] {
  const base = `${truck.id}-doc`;
  return [
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-reg`,
      truckId: truck.id,
      type: "registration",
      name: `Registration · Unit ${truck.unitNumber}`,
      status: "valid",
      uploadedAt: "2026-01-12",
      expiresAt: "2026-12-31",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-title`,
      truckId: truck.id,
      type: "title",
      name: "Certificate of Title",
      status: "valid",
      uploadedAt: "2024-03-01",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-ins`,
      truckId: truck.id,
      type: "insurance",
      name: "Commercial Auto Policy",
      status: truck.status === "out_of_service" ? "expiring" : "valid",
      uploadedAt: "2026-02-01",
      expiresAt: "2026-08-15",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-permit`,
      truckId: truck.id,
      type: "permit",
      name: "Oversize / IRP Cab Card",
      status: "valid",
      uploadedAt: "2026-01-05",
      expiresAt: "2026-12-31",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-insp`,
      truckId: truck.id,
      type: "inspection",
      name: "Annual DOT Inspection",
      status: truck.mileage > 200_000 ? "expiring" : "valid",
      uploadedAt: "2025-11-20",
      expiresAt: "2026-11-20",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-ifta`,
      truckId: truck.id,
      type: "ifta",
      name: "IFTA Decal",
      status: "valid",
      uploadedAt: "2026-01-01",
      expiresAt: "2026-12-31",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${base}-warr`,
      truckId: truck.id,
      type: "warranty",
      name: "Powertrain Warranty",
      status: truck.year >= 2022 ? "valid" : "expired",
      uploadedAt: "2022-06-01",
      expiresAt: truck.year >= 2022 ? "2027-06-01" : "2025-06-01",
    },
  ];
}

export function buildTruckPmSchedule(truck: Truck): TruckPmItem[] {
  const nextOil = truck.mileage + 8_000;
  return [
    {
      id: `${truck.id}-pm`,
      truckId: truck.id,
      category: "pm_schedule",
      label: "A-Service PM",
      dueMileage: truck.mileage + 5_000,
      dueDate: "2026-08-01",
      status: "due_soon",
      notes: "Filters, fluids, DOT walk-around",
    },
    {
      id: `${truck.id}-oil`,
      truckId: truck.id,
      category: "oil_change",
      label: "Oil & filter",
      dueMileage: nextOil,
      status: "ok",
    },
    {
      id: `${truck.id}-tires`,
      truckId: truck.id,
      category: "tires",
      label: "Steer tire depth check",
      dueMileage: truck.mileage + 12_000,
      status: truck.mileage % 80_000 > 68_000 ? "due_soon" : "ok",
    },
    {
      id: `${truck.id}-brakes`,
      truckId: truck.id,
      category: "brakes",
      label: "Brake stroke inspection",
      dueDate: "2026-07-30",
      status: "scheduled",
    },
    {
      id: `${truck.id}-battery`,
      truckId: truck.id,
      category: "battery",
      label: "Battery load test",
      dueDate: "2026-09-15",
      status: "ok",
    },
    {
      id: `${truck.id}-engine`,
      truckId: truck.id,
      category: "engine",
      label: "Engine diagnostics",
      status: truck.status === "in_shop" ? "overdue" : "ok",
      notes: truck.status === "in_shop" ? "Open work order in shop" : undefined,
    },
    {
      id: `${truck.id}-trans`,
      truckId: truck.id,
      category: "transmission",
      label: "Transmission fluid",
      dueMileage: truck.mileage + 40_000,
      status: "ok",
    },
    {
      id: `${truck.id}-def`,
      truckId: truck.id,
      category: "def",
      label: "DEF system check",
      dueDate: "2026-08-20",
      status: "ok",
    },
    {
      id: `${truck.id}-repairs`,
      truckId: truck.id,
      category: "repairs",
      label: "Open repairs",
      status: truck.status === "in_shop" ? "overdue" : "ok",
      notes: truck.status === "in_shop" ? "See service history" : "None open",
    },
    {
      id: `${truck.id}-history`,
      truckId: truck.id,
      category: "service_history",
      label: "Last completed service",
      dueDate: truck.lastServiceDate,
      status: "ok",
      notes: truck.lastServiceDate
        ? `Completed ${truck.lastServiceDate}`
        : "No service on file",
    },
  ];
}

export function buildTruckExpenses(truck: Truck): TruckExpense[] {
  return [
    {
      tenantId: DEMO_TENANT_ID,
      id: `${truck.id}-exp-1`,
      truckId: truck.id,
      category: "Maintenance",
      description: "Shop labor & parts",
      amount: truck.status === "in_shop" ? 1850 : 420,
      date: "2026-06-28",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${truck.id}-exp-2`,
      truckId: truck.id,
      category: "Fuel",
      description: "Period fuel spend",
      amount: 1480,
      date: "2026-07-01",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${truck.id}-exp-3`,
      truckId: truck.id,
      category: "Tires",
      description: "Drive axle rotation",
      amount: 310,
      date: "2026-05-20",
    },
    {
      tenantId: DEMO_TENANT_ID,
      id: `${truck.id}-exp-4`,
      truckId: truck.id,
      category: "Tolls / Fees",
      description: "IRP / tolls allocation",
      amount: 185,
      date: "2026-06-15",
    },
  ];
}

export function buildTruckCameras(truck: Truck): TruckCameraChannel[] {
  const online = truck.status !== "out_of_service";
  return [
    {
      id: `${truck.id}-cam-road`,
      truckId: truck.id,
      label: "Road-facing",
      position: "road",
      online,
      lastFrameAt: online ? "2026-07-17T16:20:00Z" : undefined,
    },
    {
      id: `${truck.id}-cam-driver`,
      truckId: truck.id,
      label: "Driver-facing",
      position: "driver",
      online,
      lastFrameAt: online ? "2026-07-17T16:20:00Z" : undefined,
    },
    {
      id: `${truck.id}-cam-side`,
      truckId: truck.id,
      label: "Passenger side",
      position: "side",
      online: online && truck.telematicsProvider !== undefined,
      lastFrameAt: online ? "2026-07-17T15:55:00Z" : undefined,
    },
    {
      id: `${truck.id}-cam-rear`,
      truckId: truck.id,
      label: "Rear / cargo",
      position: "cargo",
      online: false,
    },
  ];
}

export function buildTruckTimeline(truck: Truck): TruckTimelineEvent[] {
  return [
    {
      id: `${truck.id}-tl-1`,
      truckId: truck.id,
      label: `Status set to ${truck.status.replaceAll("_", " ")}`,
      category: "status",
      occurredAt: "2026-07-16T14:00:00Z",
    },
    {
      id: `${truck.id}-tl-2`,
      truckId: truck.id,
      label: truck.driverId
        ? "Driver assignment updated"
        : "Driver unassigned",
      category: "assignment",
      occurredAt: "2026-07-10T09:30:00Z",
    },
    {
      id: `${truck.id}-tl-3`,
      truckId: truck.id,
      label: "Fuel fill recorded",
      category: "fuel",
      occurredAt: "2026-07-01T18:12:00Z",
    },
    {
      id: `${truck.id}-tl-4`,
      truckId: truck.id,
      label: truck.lastServiceDate
        ? `Service completed (${truck.lastServiceDate})`
        : "Maintenance note added",
      category: "maintenance",
      occurredAt: `${truck.lastServiceDate ?? "2026-05-15"}T12:00:00Z`,
    },
    {
      id: `${truck.id}-tl-5`,
      truckId: truck.id,
      label: "Registration document uploaded",
      category: "document",
      occurredAt: "2026-01-12T11:00:00Z",
    },
    {
      id: `${truck.id}-tl-6`,
      truckId: truck.id,
      label: `${(truck.telematicsProvider ?? "mock").toUpperCase()} telematics linked`,
      category: "telematics",
      occurredAt: "2025-11-01T08:00:00Z",
    },
  ];
}
