/**
 * Lightweight security / request audit helpers.
 * Aligns with lib/api request IDs and lib/permissions audit for mutations.
 *
 * @see docs/architecture/security/06-audit-encryption-compliance.md
 */

import { createRequestId } from "@/lib/api/request-id";
import { logAction, type LogActionInput } from "@/lib/permissions/audit";

export type SecurityEventKind =
  | "auth.login"
  | "auth.logout"
  | "auth.denied"
  | "authz.denied"
  | "api.rate_limited"
  | "alph.denied"
  | "alph.critical_assist"
  | "secret.hygiene_warning"
  | "file.upload_rejected"
  | "other";

export type LogSecurityEventInput = {
  kind: SecurityEventKind;
  details: string;
  resource?: string;
  resourceId?: string;
  requestId?: string;
  ip?: string;
  actor?: LogActionInput["actor"];
};

/**
 * Persist a security-relevant event into the existing permissions audit log
 * (in-memory demo store today; swap for audit_events when IAM ships).
 */
export function logSecurityEvent(input: LogSecurityEventInput) {
  const requestId = input.requestId ?? createRequestId();
  const entry = logAction({
    action: input.kind,
    resource: input.resource ?? "security",
    resourceId: input.resourceId ?? requestId,
    details: `[${requestId}] ${input.details}`,
    ip: input.ip,
    actor: input.actor,
  });
  return { entry, requestId };
}

export { createRequestId };
