import type { TenantEntity } from "@/lib/types/base";

export interface Driver extends TenantEntity {
  id: string;
  name: string;
  role: string;
  status: string;
  truck: string;
  phone: string;
  license: string;
  medical: string;
  location: string;
  href: string;
}

export interface Truck extends TenantEntity {
  id: string;
  unitNumber: string;
  status: string;
  driverId?: string;
  location?: string;
}
