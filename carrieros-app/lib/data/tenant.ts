import type { Company } from "@/lib/types";

export const DEMO_TENANT_ID = "tenant-demo-001";

export const activeCompany: Company = {
  tenantId: DEMO_TENANT_ID,
  id: "company-demo-001",
  name: "Demo Carrier LLC",
};

export function getActiveTenantId(): string {
  return DEMO_TENANT_ID;
}

export function getActiveCompany(): Company {
  return activeCompany;
}
