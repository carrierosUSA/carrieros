import { getActiveCompany, getActiveTenantId } from "@/lib/data/tenant";

export type CarrierOSRole =
  | "owner"
  | "dispatcher"
  | "driver"
  | "fleet_manager"
  | "broker"
  | "customer"
  | "accountant";

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
