import type { LoadStatus } from "@/lib/types";

export type LoadStopInput = {
  city: string;
  state: string;
  address?: string;
  scheduledAt?: string;
  appointmentType?: "apt" | "fcfs";
  company?: string;
  contactName?: string;
  phone?: string;
  email?: string;
};

export type CreateLoadInput = {
  customerId: string;
  brokerId?: string;
  driverId?: string;
  truckId?: string;
  origin: LoadStopInput;
  destination: LoadStopInput;
  pickupDate: string;
  deliveryDate: string;
  rate: number;
  miles: number;
  equipmentType?: string;
  temperature?: string;
  paymentTerms?: string;
  brokerContactName?: string;
  brokerPhone?: string;
  brokerEmail?: string;
  loadNumber?: string;
  brokerLoadId?: string;
  poNumber?: string;
  commodity?: string;
  weight?: number;
  pieces?: number;
  notes?: string;
};

export type UpdateLoadInput = {
  customerId?: string;
  brokerId?: string;
  driverId?: string;
  truckId?: string;
  origin?: LoadStopInput;
  destination?: LoadStopInput;
  pickupDate?: string;
  deliveryDate?: string;
  rate?: number;
  miles?: number;
  equipmentType?: string;
  temperature?: string;
  paymentTerms?: string;
  brokerContactName?: string;
  brokerPhone?: string;
  brokerEmail?: string;
  loadNumber?: string;
  brokerLoadId?: string;
  poNumber?: string;
  commodity?: string;
  weight?: number;
  pieces?: number;
  notes?: string;
  status?: LoadStatus;
  invoiceId?: string;
};

export type AssignDriverInput = {
  driverId: string;
};

export type AssignTruckInput = {
  truckId: string;
};
