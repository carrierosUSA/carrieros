export const BUSINESS_ROLES = [
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
] as const;

export type BusinessRole = (typeof BUSINESS_ROLES)[number];

const BUSINESS_ROLE_SET = new Set<string>(BUSINESS_ROLES);

export function isBusinessRole(value: string): value is BusinessRole {
  return BUSINESS_ROLE_SET.has(value);
}
