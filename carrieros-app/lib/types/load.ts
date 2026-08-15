import type { TenantEntity } from "@/lib/types/base";

export type LoadStatus =
  | "pending"
  | "dispatched"
  | "en_route_to_pickup"
  | "arrived_pickup"
  | "picked_up"
  | "in_transit"
  | "arrived_delivery"
  | "delivered"
  | "closed"
  | "cancelled";

export interface LoadStop {
  id?: string;
  company?: string;
  address?: string;
  city: string;
  state: string;
  scheduledAt?: string;
}

/** Type-only operational boundary. Document intake never mutates a load. */
export interface Load extends TenantEntity {
  id: string;
  companyId: string;
  reference: string;
  status: LoadStatus;
  origin: LoadStop;
  destination: LoadStop;
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}
