import type {
  FuelRecord,
  MaintenanceRecord,
  Trailer,
  Truck,
} from "@/lib/types";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

export const seedTrucks: Truck[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "truck-102",
    unitNumber: "102",
    status: "assigned",
    make: "Freightliner",
    model: "Cascadia",
    year: 2022,
    vin: "1FUJGHDV8NLBT1021",
    licensePlate: "TX-FLT102",
    mileage: 142500,
    driverId: "onkar-singh",
    location: "San Antonio, TX",
    lastServiceDate: "2026-05-15",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "truck-104",
    unitNumber: "104",
    status: "available",
    make: "Kenworth",
    model: "T680",
    year: 2021,
    vin: "1XKYD49X2MJ104882",
    licensePlate: "TX-FLT104",
    mileage: 118300,
    location: "San Antonio, TX",
    lastServiceDate: "2026-04-02",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "truck-107",
    unitNumber: "107",
    status: "maintenance",
    make: "Volvo",
    model: "VNL 760",
    year: 2020,
    vin: "4V4NC9EH5LN107441",
    licensePlate: "TX-FLT107",
    mileage: 201800,
    location: "Austin, TX",
    lastServiceDate: "2026-06-28",
  },
];

export const seedTrailers: Trailer[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "trailer-2201",
    unitNumber: "2201",
    type: "Dry Van",
    status: "assigned",
    licensePlate: "TX-TRL2201",
    location: "San Antonio, TX",
    truckId: "truck-102",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "trailer-2204",
    unitNumber: "2204",
    type: "Reefer",
    status: "available",
    licensePlate: "TX-TRL2204",
    location: "San Antonio, TX",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "trailer-2210",
    unitNumber: "2210",
    type: "Flatbed",
    status: "maintenance",
    licensePlate: "TX-TRL2210",
    location: "Austin, TX",
  },
];

export const seedMaintenanceRecords: MaintenanceRecord[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "maint-001",
    truckId: "truck-107",
    type: "Engine Service",
    description: "Oil change, filter replacement, DOT inspection prep.",
    status: "in_progress",
    scheduledDate: "2026-06-28",
    cost: 850,
    mileage: 201800,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "maint-002",
    truckId: "truck-102",
    type: "Preventive Maintenance",
    description: "Scheduled 140k mile service completed.",
    status: "completed",
    scheduledDate: "2026-05-15",
    completedDate: "2026-05-15",
    cost: 620,
    mileage: 140200,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "maint-003",
    truckId: "truck-104",
    trailerId: "trailer-2204",
    type: "Reefer Unit Check",
    description: "Reefer unit calibration and trailer brake inspection.",
    status: "scheduled",
    scheduledDate: "2026-07-08",
    cost: 400,
    mileage: 118300,
  },
];

export const seedFuelRecords: FuelRecord[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "fuel-001",
    truckId: "truck-102",
    date: "2026-07-01",
    gallons: 142,
    cost: 512.4,
    location: "San Antonio, TX",
    mileage: 142100,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "fuel-002",
    truckId: "truck-104",
    date: "2026-06-29",
    gallons: 128,
    cost: 461.2,
    location: "Houston, TX",
    mileage: 117900,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "fuel-003",
    truckId: "truck-102",
    date: "2026-06-27",
    gallons: 155,
    cost: 558.9,
    location: "Dallas, TX",
    mileage: 141700,
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "fuel-004",
    truckId: "truck-107",
    date: "2026-06-25",
    gallons: 136,
    cost: 489.6,
    location: "Austin, TX",
    mileage: 201500,
  },
];

export const truckStore: Truck[] = structuredClone(seedTrucks);
export const trailerStore: Trailer[] = structuredClone(seedTrailers);
export const maintenanceStore: MaintenanceRecord[] = structuredClone(seedMaintenanceRecords);
export const fuelStore: FuelRecord[] = structuredClone(seedFuelRecords);

export function getTruckById(id: string): Truck | undefined {
  return truckStore.find((truck) => truck.id === id);
}

export function getTrailerById(id: string): Trailer | undefined {
  return trailerStore.find((trailer) => trailer.id === id);
}
