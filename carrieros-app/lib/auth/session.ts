import { getActiveCompany, getActiveTenantId } from "@/lib/data/tenant";

/**
 * Session roles used across CarrierOS.
 * Legacy aliases (accountant, mechanic, fleet_manager) remain for Sidebar / docs.
 * Enterprise permissions map these via mapSessionRoleToEnterprise().
 */
export type CarrierOSRole =
  | "super_admin"
  | "owner"
  | "dispatcher"
  | "accounting"
  | "accountant"
  | "safety"
  | "maintenance"
  | "mechanic"
  | "fleet_manager"
  | "driver"
  | "broker"
  | "shipper"
  | "customer"
  | "read_only";

export type CarrierOSSession = {
  tenantId: string;
  companyId: string;
  userId: string;
  name: string;
  role: CarrierOSRole;
  isAuthenticated: boolean;
};

export function getCurrentSession(): CarrierOSSession {
  const company = getActiveCompany();

  return {
    tenantId: getActiveTenantId(),
    companyId: company.id,
    userId: "alpha-owner",
    name: "Alpha Owner",
    role: "owner",
    isAuthenticated: true,
  };
}

export function requireRole(allowedRoles: CarrierOSRole[]): CarrierOSSession {
  const session = getCurrentSession();

  if (!allowedRoles.includes(session.role)) {
    throw new Error("User role is not authorized for this alpha action.");
  }

  return session;
}
