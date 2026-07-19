import { getPermissionDef } from "@/lib/permissions/permissions-catalog";
import { roleDisplayName } from "@/lib/permissions/roles";
import {
  getEffectiveRoleForSession,
  getRolePermissions,
} from "@/lib/permissions/store";
import type { PermissionId, RoleId } from "@/lib/permissions/types";
import { getCurrentSession } from "@/lib/auth/session";

export type PermissionSubject = {
  userId: string;
  role: string;
  name?: string;
};

/** Resolve effective enterprise role for a session-like subject */
export function resolveRoleId(subject?: PermissionSubject | null): RoleId {
  const session = subject ?? getCurrentSession();
  return getEffectiveRoleForSession({
    userId: session.userId,
    role: session.role,
  });
}

export function listPermissionsForSubject(
  subject?: PermissionSubject | null,
): PermissionId[] {
  return getRolePermissions(resolveRoleId(subject));
}

/**
 * Check whether a user/session may perform a permission.
 * Super Admin and Owner always pass when their role matrices include all permissions
 * (defaults); custom overrides still apply.
 */
export function can(
  subject: PermissionSubject | null | undefined,
  permission: PermissionId,
): boolean {
  const roleId = resolveRoleId(subject ?? undefined);
  const perms = getRolePermissions(roleId);
  return perms.includes(permission);
}

export function canCurrentUser(permission: PermissionId): boolean {
  return can(getCurrentSession(), permission);
}

export function permissionDeniedReason(
  subject: PermissionSubject | null | undefined,
  permission: PermissionId,
): string | null {
  if (can(subject, permission)) return null;
  const roleId = resolveRoleId(subject ?? undefined);
  const def = getPermissionDef(permission);
  const actionLabel = def?.label ?? permission;
  return `You don't have permission to ${actionLabel.toLowerCase()}. (${roleDisplayName(roleId)})`;
}

export const DENIED_TOOLTIP = "You don't have permission";
