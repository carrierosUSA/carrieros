import type { LoadStatus } from "@/lib/types";

export type LoadStopInput = {
  city: string;
  state: string;
  scheduledAt?: string;
};

export type CreateLoadInput = {
  customerId: string;
  brokerId?: string;
  origin: LoadStopInput;
  destination: LoadStopInput;
  pickupDate: string;
  deliveryDate: string;
  rate: number;
  miles: number;
};

export type UpdateLoadInput = {
  customerId?: string;
  brokerId?: string;
  origin?: LoadStopInput;
  destination?: LoadStopInput;
  pickupDate?: string;
  deliveryDate?: string;
  rate?: number;
  miles?: number;
  status?: LoadStatus;
  invoiceId?: string;
};

export type AssignDriverInput = {
  driverId: string;
};

export type AssignTruckInput = {
  truckId: string;
};
