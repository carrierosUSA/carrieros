export interface TenantEntity {
  tenantId: string;
}

export type ComplianceStatus = "clear" | "attention" | "blocked";

export interface Company extends TenantEntity {
  id: string;
  name: string;
}
