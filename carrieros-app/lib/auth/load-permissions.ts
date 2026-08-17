import type { BusinessRole } from "@/lib/auth/roles";

const LOAD_CREATION_ROLES = new Set<BusinessRole>([
  "super_admin",
  "owner",
  "dispatcher",
]);

export function canCreateLoads(role: BusinessRole): boolean {
  return LOAD_CREATION_ROLES.has(role);
}
