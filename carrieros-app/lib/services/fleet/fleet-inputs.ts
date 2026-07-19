import type {
  TruckStatus,
  TrailerStatus,
  TrailerType,
  ReeferOemName,
  TelematicsProviderName,
} from "@/lib/types";

export type CreateTruckInput = {
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
  mpg?: number;
  idleHours?: number;
  costPerMile?: number;
};

export type UpdateTruckInput = Partial<CreateTruckInput>;

export type CreateTrailerInput = {
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
  mileage?: number;
  lengthFt?: number;
  telematicsProvider?: TelematicsProviderName;
  reeferOem?: ReeferOemName;
};

export type UpdateTrailerInput = Partial<CreateTrailerInput>;
