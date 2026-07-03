import type { TenantEntity } from "@/lib/types/base";

export interface Driver extends TenantEntity {
  id: string;
  name: string;
  role: string;
  status: string;
  truck: string;
  phone: string;
  license: string;
  medical: string;
  location: string;
  href: string;
}

export type TruckStatus = "available" | "assigned" | "maintenance" | "out_of_service";

export interface Truck extends TenantEntity {
  id: string;
  unitNumber: string;
  status: TruckStatus;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  mileage: number;
  driverId?: string;
  location?: string;
  lastServiceDate?: string;
}

export type TrailerStatus = "available" | "assigned" | "maintenance" | "out_of_service";

export interface Trailer extends TenantEntity {
  id: string;
  unitNumber: string;
  type: string;
  status: TrailerStatus;
  licensePlate: string;
  location?: string;
  truckId?: string;
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
  "assigned",
  "maintenance",
  "out_of_service",
];

export const TRUCK_STATUS_LABELS: Record<TruckStatus, string> = {
  available: "Available",
  assigned: "Assigned",
  maintenance: "Maintenance",
  out_of_service: "Out of Service",
};

export const TRAILER_STATUSES: TrailerStatus[] = [
  "available",
  "assigned",
  "maintenance",
  "out_of_service",
];

export const TRAILER_STATUS_LABELS: Record<TrailerStatus, string> = {
  available: "Available",
  assigned: "Assigned",
  maintenance: "Maintenance",
  out_of_service: "Out of Service",
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
};
