import type { TenantEntity } from "@/lib/types/base";

/** Equipment / operational status for a power unit. */
export type TruckStatus =
  | "available"
  | "on_load"
  | "idle"
  | "in_shop"
  | "out_of_service";

export type TruckDocumentType =
  | "registration"
  | "title"
  | "insurance"
  | "permit"
  | "inspection"
  | "ifta"
  | "warranty"
  | "other";

export type TruckDocumentStatus = "valid" | "expiring" | "expired" | "missing";

export type TruckPmCategory =
  | "pm_schedule"
  | "oil_change"
  | "tires"
  | "brakes"
  | "battery"
  | "engine"
  | "transmission"
  | "def"
  | "repairs"
  | "service_history";

export type TruckTimelineCategory =
  | "assignment"
  | "maintenance"
  | "fuel"
  | "document"
  | "telematics"
  | "expense"
  | "status";

export type TelematicsProviderName =
  | "mock"
  | "samsara"
  | "motive"
  | "geotab"
  | "omnitracs";

export interface Truck extends TenantEntity {
  id: string;
  unitNumber: string;
  status: TruckStatus;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  licenseState?: string;
  mileage: number;
  driverId?: string;
  location?: string;
  lastServiceDate?: string;
  photoUrl?: string;
  engineHours?: number;
  /** Rolling average MPG from telematics / fuel logs. */
  mpg?: number;
  /** Idle hours in the current period (telematics). */
  idleHours?: number;
  /** Fully loaded cost per mile estimate. */
  costPerMile?: number;
  telematicsProvider?: TelematicsProviderName;
}

export interface TruckDocument extends TenantEntity {
  id: string;
  truckId: string;
  type: TruckDocumentType;
  name: string;
  status: TruckDocumentStatus;
  uploadedAt: string;
  expiresAt?: string;
}

export interface TruckExpense extends TenantEntity {
  id: string;
  truckId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface TruckPmItem {
  id: string;
  truckId: string;
  category: TruckPmCategory;
  label: string;
  dueMileage?: number;
  dueDate?: string;
  status: "ok" | "due_soon" | "overdue" | "scheduled";
  notes?: string;
}

export interface TruckTimelineEvent {
  id: string;
  truckId: string;
  label: string;
  category: TruckTimelineCategory;
  occurredAt: string;
}

export interface TruckCameraChannel {
  id: string;
  truckId: string;
  label: string;
  position: "road" | "driver" | "cargo" | "side" | "rear";
  online: boolean;
  lastFrameAt?: string;
}

/** Operational status for a trailer asset. */
export type TrailerStatus =
  | "available"
  | "loaded"
  | "empty"
  | "in_yard"
  | "in_shop"
  | "out_of_service";

export type TrailerType =
  | "dry_van"
  | "reefer"
  | "flatbed"
  | "step_deck"
  | "tank"
  | "lowboy"
  | "other";

export type TrailerDocumentType =
  | "registration"
  | "insurance"
  | "annual_inspection"
  | "reefer_inspection"
  | "warranty"
  | "other";

export type TrailerDocumentStatus = "valid" | "expiring" | "expired" | "missing";

export type TrailerPmCategory =
  | "pm_schedule"
  | "brake_inspection"
  | "tire_inspection"
  | "wheel_seals"
  | "lights"
  | "abs"
  | "suspension"
  | "repairs"
  | "service_history";

export type TrailerTimelineCategory =
  | "assignment"
  | "maintenance"
  | "document"
  | "telematics"
  | "reefer"
  | "status"
  | "load";

export type ReeferOemName = "mock" | "thermo_king" | "carrier" | "telematics";

export type TrailerTireStatus = "ok" | "watch" | "replace";

export interface Trailer extends TenantEntity {
  id: string;
  unitNumber: string;
  type: TrailerType;
  status: TrailerStatus;
  licensePlate: string;
  licenseState?: string;
  vin?: string;
  year?: number;
  make?: string;
  photoUrl?: string;
  location?: string;
  truckId?: string;
  lastServiceDate?: string;
  /** Trailer length in feet when known (e.g. 53). */
  lengthFt?: number;
  /** Approximate miles on trailer when known. */
  mileage?: number;
  telematicsProvider?: TelematicsProviderName;
  /** OEM adapter for reefer units (Thermo King / Carrier / telematics). */
  reeferOem?: ReeferOemName;
  reeferCurrentTempF?: number;
  reeferSetTempF?: number;
  reeferFuelLevelPercent?: number;
  reeferEngineHours?: number;
}

export interface TrailerDocument extends TenantEntity {
  id: string;
  trailerId: string;
  type: TrailerDocumentType;
  name: string;
  status: TrailerDocumentStatus;
  uploadedAt: string;
  expiresAt?: string;
}

export interface TrailerPmItem {
  id: string;
  trailerId: string;
  category: TrailerPmCategory;
  label: string;
  dueMileage?: number;
  dueDate?: string;
  status: "ok" | "due_soon" | "overdue" | "scheduled";
  notes?: string;
}

export interface TrailerTirePosition {
  id: string;
  trailerId: string;
  position: string;
  treadDepthMm: number;
  psi: number;
  status: TrailerTireStatus;
  installedAt?: string;
}

export interface TrailerTimelineEvent {
  id: string;
  trailerId: string;
  label: string;
  category: TrailerTimelineCategory;
  occurredAt: string;
}

export type MaintenanceStatus = "scheduled" | "in_progress" | "completed";

export interface MaintenanceRecord extends TenantEntity {
  id: string;
  truckId: string;
  trailerId?: string;
  type: string;
  description: string;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  cost: number;
  mileage: number;
}

export interface FuelRecord extends TenantEntity {
  id: string;
  truckId: string;
  date: string;
  gallons: number;
  cost: number;
  location: string;
  mileage: number;
}

export const TRUCK_STATUSES: TruckStatus[] = [
  "available",
  "on_load",
  "idle",
  "in_shop",
  "out_of_service",
];

export const TRUCK_STATUS_LABELS: Record<TruckStatus, string> = {
  available: "Available",
  on_load: "On Load",
  idle: "Idle",
  in_shop: "In Shop",
  out_of_service: "Out of Service",
};

export const TRUCK_DOCUMENT_TYPE_LABELS: Record<TruckDocumentType, string> = {
  registration: "Registration",
  title: "Title",
  insurance: "Insurance",
  permit: "Permit",
  inspection: "Inspection",
  ifta: "IFTA",
  warranty: "Warranty",
  other: "Other",
};

export const TRUCK_PM_CATEGORY_LABELS: Record<TruckPmCategory, string> = {
  pm_schedule: "PM Schedule",
  oil_change: "Oil Change",
  tires: "Tires",
  brakes: "Brakes",
  battery: "Battery",
  engine: "Engine",
  transmission: "Transmission",
  def: "DEF",
  repairs: "Repairs",
  service_history: "Service History",
};

export const TRAILER_STATUSES: TrailerStatus[] = [
  "available",
  "loaded",
  "empty",
  "in_yard",
  "in_shop",
  "out_of_service",
];

export const TRAILER_STATUS_LABELS: Record<TrailerStatus, string> = {
  available: "Available",
  loaded: "Loaded",
  empty: "Empty",
  in_yard: "In Yard",
  in_shop: "In Shop",
  out_of_service: "Out of Service",
};

export const TRAILER_TYPES: TrailerType[] = [
  "dry_van",
  "reefer",
  "flatbed",
  "step_deck",
  "tank",
  "lowboy",
  "other",
];

export const TRAILER_TYPE_LABELS: Record<TrailerType, string> = {
  dry_van: "Dry Van",
  reefer: "Reefer",
  flatbed: "Flatbed",
  step_deck: "Step Deck",
  tank: "Tank",
  lowboy: "Lowboy",
  other: "Other",
};

export const TRAILER_DOCUMENT_TYPE_LABELS: Record<TrailerDocumentType, string> = {
  registration: "Registration",
  insurance: "Insurance",
  annual_inspection: "Annual Inspection",
  reefer_inspection: "Reefer Inspection",
  warranty: "Warranty",
  other: "Other",
};

export const TRAILER_PM_CATEGORY_LABELS: Record<TrailerPmCategory, string> = {
  pm_schedule: "PM Schedule",
  brake_inspection: "Brake Inspection",
  tire_inspection: "Tire Inspection",
  wheel_seals: "Wheel Seals",
  lights: "Lights",
  abs: "ABS",
  suspension: "Suspension",
  repairs: "Repairs",
  service_history: "Service History",
};

export function isReeferTrailer(trailer: Pick<Trailer, "type">): boolean {
  return trailer.type === "reefer";
}

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
};
