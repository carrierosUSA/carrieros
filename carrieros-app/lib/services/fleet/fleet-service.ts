import type {
  Driver,
  FuelRecord,
  MaintenanceRecord,
  Trailer,
  Truck,
} from "@/lib/types";
import type {
  CreateTrailerInput,
  CreateTruckInput,
  UpdateTrailerInput,
  UpdateTruckInput,
} from "@/lib/services/fleet/fleet-inputs";

export type FleetMetrics = {
  totalTrucks: number;
  availableTrucks: number;
  /** @deprecated Prefer onLoadTrucks — kept for older dashboard cards. */
  assignedTrucks: number;
  onLoadTrucks: number;
  idleTrucks: number;
  /** @deprecated Prefer inShopTrucks. */
  maintenanceTrucks: number;
  inShopTrucks: number;
  outOfServiceTrucks: number;
  totalTrailers: number;
  openMaintenance: number;
  monthlyFuelCost: number;
};

export interface FleetService {
  listDrivers(tenantId: string): Promise<Driver[]>;
  listTrucks(tenantId: string): Promise<Truck[]>;
  getTruck(tenantId: string, truckId: string): Promise<Truck | null>;
  createTruck(tenantId: string, input: CreateTruckInput): Promise<Truck>;
  updateTruck(tenantId: string, truckId: string, input: UpdateTruckInput): Promise<Truck>;
  listTrailers(tenantId: string): Promise<Trailer[]>;
  getTrailer(tenantId: string, trailerId: string): Promise<Trailer | null>;
  createTrailer(tenantId: string, input: CreateTrailerInput): Promise<Trailer>;
  updateTrailer(
    tenantId: string,
    trailerId: string,
    input: UpdateTrailerInput,
  ): Promise<Trailer>;
  listMaintenance(tenantId: string, truckId?: string): Promise<MaintenanceRecord[]>;
  listFuelRecords(tenantId: string, truckId?: string): Promise<FuelRecord[]>;
  getFleetMetrics(tenantId: string): Promise<FleetMetrics>;
}

export type {
  CreateTrailerInput,
  CreateTruckInput,
  UpdateTrailerInput,
  UpdateTruckInput,
} from "@/lib/services/fleet/fleet-inputs";
