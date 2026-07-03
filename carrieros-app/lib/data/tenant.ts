import type { Company } from "@/lib/types";

export const DEMO_TENANT_ID = "tenant-demo-001";

export const activeCompany: Company = {
  tenantId: DEMO_TENANT_ID,
  id: "company-demo-001",
  name: "Lone Star Alpha Carrier",
  dotNumber: "USDOT-3482910",
  mcNumber: "MC-927451",
  homeBase: "San Antonio, TX",
  timezone: "America/Chicago",
};

export function getActiveTenantId(): string {
  return DEMO_TENANT_ID;
}

export function getActiveCompany(): Company {
  return activeCompany;
}
