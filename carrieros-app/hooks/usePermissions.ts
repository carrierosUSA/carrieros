"use client";

import { useSyncExternalStore } from "react";
import { getCurrentSession } from "@/lib/auth/session";
import {
  can,
  permissionDeniedReason,
  resolveRoleId,
} from "@/lib/permissions/check";
import { roleDisplayName } from "@/lib/permissions/roles";
import {
  getPermissionsStore,
  subscribePermissionsStore,
} from "@/lib/permissions/store";
import type { PermissionId, RoleId } from "@/lib/permissions/types";

function getSnapshot() {
  return getPermissionsStore();
}

function getServerSnapshot() {
  return getPermissionsStore();
}

export function usePermissions() {
  useSyncExternalStore(
    subscribePermissionsStore,
    getSnapshot,
    getServerSnapshot,
  );

  const session = getCurrentSession();
  const roleId: RoleId = resolveRoleId(session);

  return {
    session,
    roleId,
    roleName: roleDisplayName(roleId),
    can: (permission: PermissionId) => can(session, permission),
    cannotReason: (permission: PermissionId) =>
      permissionDeniedReason(session, permission),
  };
}
