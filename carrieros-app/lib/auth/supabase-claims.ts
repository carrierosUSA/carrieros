import type { CarrierOSRole } from "@/lib/auth/session";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const BUSINESS_ROLES = new Set<CarrierOSRole>([
  "super_admin",
  "owner",
  "dispatcher",
  "accounting",
  "safety",
  "maintenance",
  "driver",
  "broker",
  "shipper",
  "customer",
  "read_only",
]);

const DOCUMENT_APPROVAL_ROLES = new Set<CarrierOSRole>([
  "super_admin",
  "owner",
  "accounting",
]);

export type VerifiedSupabaseIdentity = {
  userId: string;
  companyId: string;
  businessRole: CarrierOSRole;
};

export type SupabaseUserClaims = {
  id: string;
  app_metadata?: Record<string, unknown> | null;
};

export type VerifiedIdentityResult =
  | { ok: true; identity: VerifiedSupabaseIdentity }
  | {
      ok: false;
      reason:
        | "unauthenticated"
        | "missing_company"
        | "invalid_company"
        | "missing_role"
        | "unauthorized_role";
    };

export function deriveVerifiedSupabaseIdentity(
  user: SupabaseUserClaims | null | undefined,
): VerifiedIdentityResult {
  if (!user?.id) return { ok: false, reason: "unauthenticated" };

  const metadata = user.app_metadata ?? {};
  const companyId =
    typeof metadata.company_id === "string" ? metadata.company_id.trim() : "";
  if (!companyId) return { ok: false, reason: "missing_company" };
  if (!UUID_PATTERN.test(companyId)) {
    return { ok: false, reason: "invalid_company" };
  }

  const businessRole =
    typeof metadata.business_role === "string"
      ? metadata.business_role.trim()
      : "";
  if (!businessRole) return { ok: false, reason: "missing_role" };
  if (!BUSINESS_ROLES.has(businessRole as CarrierOSRole)) {
    return { ok: false, reason: "unauthorized_role" };
  }

  return {
    ok: true,
    identity: {
      userId: user.id,
      companyId,
      businessRole: businessRole as CarrierOSRole,
    },
  };
}

export function hasSameCompanyAccess(
  identity: VerifiedSupabaseIdentity,
  companyId: string,
): boolean {
  return identity.companyId === companyId;
}

export function canApproveDocument(
  identity: VerifiedSupabaseIdentity,
): boolean {
  return DOCUMENT_APPROVAL_ROLES.has(identity.businessRole);
}
