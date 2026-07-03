import type { TenantEntity } from "@/lib/types/base";

export interface Invoice extends TenantEntity {
  id: string;
  reference: string;
  status: string;
  amount: number;
  dueDate: string;
  loadId?: string;
}

export interface Document extends TenantEntity {
  id: string;
  type: string;
  status: string;
  expiresAt?: string;
  entityId: string;
  entityType: "load" | "driver" | "truck" | "company";
  loadId?: string;
}
