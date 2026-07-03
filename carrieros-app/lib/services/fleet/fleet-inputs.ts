import type { TruckStatus, TrailerStatus } from "@/lib/types";

export type CreateTruckInput = {
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
};

export type UpdateTruckInput = Partial<CreateTruckInput>;

export type CreateTrailerInput = {
  unitNumber: string;
  type: string;
  status: TrailerStatus;
  licensePlate: string;
  location?: string;
  truckId?: string;
};

export type UpdateTrailerInput = Partial<CreateTrailerInput>;
