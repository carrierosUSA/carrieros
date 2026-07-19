import type { ComplianceStatus, TenantEntity } from "@/lib/types/base";

export type LoadStatus =
  | "pending"
  | "dispatched"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "invoiced"
  | "cancelled";

export type AppointmentType = "apt" | "fcfs";

export interface LoadStop {
  city: string;
  state: string;
  address?: string;
  scheduledAt?: string;
  appointmentType?: AppointmentType;
  company?: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export interface LoadTimelineEvent {
  id: string;
  loadId: string;
  status: LoadStatus | "created" | "assigned";
  label: string;
  occurredAt: string;
  location?: string;
}

export interface Load extends TenantEntity {
  id: string;
  reference: string;
  status: LoadStatus;
  customerId: string;
  brokerId?: string;
  driverId?: string;
  truckId?: string;
  origin: LoadStop;
  destination: LoadStop;
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
  documentIds: string[];
  invoiceId?: string;
  trackingToken?: string;
  trackingEnabled?: boolean;
  trackingDisabledAt?: string;
  complianceStatus: ComplianceStatus;
  novaSummary?: string;
  timeline: LoadTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export const LOAD_STATUSES: LoadStatus[] = [
  "pending",
  "dispatched",
  "picked_up",
  "in_transit",
  "delivered",
  "invoiced",
  "cancelled",
];

export const LOAD_STATUS_LABELS: Record<LoadStatus, string> = {
  pending: "Pending",
  dispatched: "Dispatched",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  invoiced: "Invoiced",
  cancelled: "Cancelled",
};
