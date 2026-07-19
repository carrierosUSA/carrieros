/**
 * API auth context pattern for `/api/v1`.
 *
 * TODAY: wraps the demo session in `lib/auth/session.ts`. Supabase Auth is not
 * fully wired yet — see docs/architecture/api/05-authorization.md and iam/.
 *
 * HARD RULES (must hold when Supabase is connected):
 * - Never trust client-supplied company_id without membership verification.
 * - Never expose service-role credentials to the browser.
 * - Re-check AuthN + membership + permission on every mutation.
 */

import { getCurrentSession, type CarrierOSSession } from "@/lib/auth/session";
import { can, type PermissionSubject } from "@/lib/permissions/check";
import type { PermissionId } from "@/lib/permissions/types";
import { ApiError, forbiddenError, unauthorizedError } from "@/lib/api/errors";

export type ApiAuthContext = {
  requestId: string;
  userId: string;
  companyId: string;
  tenantId: string;
  name: string;
  role: CarrierOSSession["role"];
  isAuthenticated: true;
  /** Demo/stub: membership assumed for active session company. */
  membershipVerified: boolean;
};

export type ResolveAuthOptions = {
  requestId: string;
  /**
   * Optional client hint (header/body). MUST NOT become companyId unless it
   * matches the verified session membership. Today we only accept equality
   * with the session company; mismatches → forbidden.
   */
  claimedCompanyId?: string | null;
};

/**
 * Resolve auth context from the current server session.
 * Replace internals with Supabase user + membership lookup when IAM ships.
 */
export function resolveApiAuthContext(options: ResolveAuthOptions): ApiAuthContext {
  const session = getCurrentSession();

  if (!session.isAuthenticated) {
    throw unauthorizedError(options.requestId, "Session not authenticated");
  }

  const claimed = options.claimedCompanyId?.trim() || null;
  if (claimed && claimed !== session.companyId) {
    throw new ApiError({
      code: "forbidden",
      message: "You don't have access to that company.",
      httpStatus: 403,
      requestId: options.requestId,
      technicalMessage: `claimed company_id ${claimed} != session ${session.companyId}`,
    });
  }

  // Stub: treat active session company as membership-verified.
  // TODO(iam): load company_memberships and assert status === active.
  const membershipVerified = true;

  return {
    requestId: options.requestId,
    userId: session.userId,
    companyId: session.companyId,
    tenantId: session.tenantId,
    name: session.name,
    role: session.role,
    isAuthenticated: true,
    membershipVerified,
  };
}

export function assertCompanyMembership(
  ctx: ApiAuthContext,
  companyId: string,
): void {
  if (!ctx.membershipVerified || ctx.companyId !== companyId) {
    throw forbiddenError(
      ctx.requestId,
      `Membership assert failed for company ${companyId}`,
    );
  }
}

export function requireApiPermission(
  ctx: ApiAuthContext,
  permission: PermissionId,
): void {
  const subject: PermissionSubject = {
    userId: ctx.userId,
    role: ctx.role,
    name: ctx.name,
  };

  if (!can(subject, permission)) {
    throw forbiddenError(
      ctx.requestId,
      `Missing permission ${permission} for user ${ctx.userId}`,
    );
  }
}

/** company_id from context only — never from untrusted body as source of truth. */
export function tenantCompanyId(ctx: ApiAuthContext): string {
  return ctx.companyId;
}
