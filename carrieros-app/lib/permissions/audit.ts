import { getCurrentSession } from "@/lib/auth/session";
import { roleDisplayName } from "@/lib/permissions/roles";
import {
  appendAuditEntry,
  getEffectiveRoleForSession,
  listAuditEntries,
} from "@/lib/permissions/store";
import type { AuditEntry } from "@/lib/permissions/types";

export type LogActionInput = {
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ip?: string;
  actor?: {
    userId: string;
    name: string;
    role: string;
  };
};

export function logAction(input: LogActionInput): AuditEntry {
  const session = getCurrentSession();
  const actor = input.actor ?? {
    userId: session.userId,
    name: session.name,
    role: session.role,
  };
  const roleId = getEffectiveRoleForSession({
    userId: actor.userId,
    role: actor.role,
  });

  return appendAuditEntry({
    actorUserId: actor.userId,
    actorName: actor.name,
    role: roleDisplayName(roleId),
    action: input.action,
    resource: input.resource,
    resourceId: input.resourceId,
    details: input.details,
    ip: input.ip,
  });
}

export function getAuditLog(): AuditEntry[] {
  return listAuditEntries();
}

export function filterAuditLog(opts: {
  query?: string;
  action?: string;
  resource?: string;
  actorUserId?: string;
}): AuditEntry[] {
  const q = opts.query?.trim().toLowerCase() ?? "";
  return listAuditEntries().filter((entry) => {
    if (opts.action && entry.action !== opts.action) return false;
    if (opts.resource && !entry.resource.startsWith(opts.resource)) {
      return false;
    }
    if (opts.actorUserId && entry.actorUserId !== opts.actorUserId) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      entry.actorName,
      entry.role,
      entry.action,
      entry.resource,
      entry.resourceId ?? "",
      entry.details,
      entry.ip ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
