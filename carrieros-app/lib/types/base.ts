export interface TenantEntity {
  tenantId: string;
}

export type ComplianceStatus = "clear" | "attention" | "blocked";

export interface Company extends TenantEntity {
  id: string;
  name: string;
  dotNumber?: string;
  mcNumber?: string;
  homeBase?: string;
  timezone?: string;
}
