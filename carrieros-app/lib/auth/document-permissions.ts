import type { BusinessRole } from "@/lib/auth/roles";

const DOCUMENT_UPLOAD_ROLES = new Set<BusinessRole>([
  "super_admin",
  "owner",
  "dispatcher",
  "accounting",
  "safety",
  "maintenance",
  "driver",
  "shipper",
]);

const DOCUMENT_APPROVAL_ROLES = new Set<BusinessRole>([
  "super_admin",
  "owner",
  "accounting",
]);

export function canUploadDocuments(role: BusinessRole): boolean {
  return DOCUMENT_UPLOAD_ROLES.has(role);
}

export function canApproveDocuments(role: BusinessRole): boolean {
  return DOCUMENT_APPROVAL_ROLES.has(role);
}
