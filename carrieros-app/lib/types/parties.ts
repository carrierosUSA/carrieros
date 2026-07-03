import type { TenantEntity } from "@/lib/types/base";

export interface Customer extends TenantEntity {
  id: string;
  name: string;
  type: "shipper" | "consignee" | "both";
}

export interface Broker extends TenantEntity {
  id: string;
  name: string;
  mcNumber?: string;
}
