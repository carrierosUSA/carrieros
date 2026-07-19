import { appendAlphAudit } from "@/lib/alph/audit/store";
import type { AlphMode } from "@/lib/alph/modes";
import { getAlphTool } from "@/lib/alph/tools/registry";
import type {
  AlphToolContext,
  AlphToolExecutionResult,
  AlphToolId,
} from "@/lib/alph/tools/types";
import {
  defaultRateLimiter,
  SENSITIVE_RATE_LIMITS,
} from "@/lib/api/rate-limit";
import { can } from "@/lib/permissions/check";
import { logSecurityEvent } from "@/lib/security/audit";

/**
 * Permission gateway for Alph tools.
 * Enforces: session permissions, company isolation (via tool), rate limits, audit.
 * Never elevates. Never silently runs write tools (write tools are not registered yet).
 */
export async function executeAlphTool(
  toolId: AlphToolId,
  input: unknown,
  ctx: AlphToolContext,
): Promise<AlphToolExecutionResult> {
  const tool = getAlphTool(toolId);
  if (!tool) {
    return {
      ok: false,
      code: "not_found",
      message: `Unknown Alph tool: ${toolId}`,
    };
  }

  const subject = {
    userId: ctx.context.userId,
    role: ctx.context.role,
    name: ctx.context.userName,
  };

  if (!can(subject, tool.permission)) {
    logSecurityEvent({
      kind: "alph.denied",
      resource: `alph.tool.${toolId}`,
      details: `Permission ${tool.permission} denied`,
    });
    appendAlphAudit({
      requestId: ctx.requestId,
      companyId: ctx.context.companyId,
      tenantId: ctx.context.tenantId,
      userId: ctx.context.userId,
      workspace: ctx.context.workspace,
      event: "tool_denied",
      toolId,
      mode: ctx.mode,
      details: `Permission required: ${tool.permission}`,
    });
    return {
      ok: false,
      code: "permission_denied",
      message: `You don't have permission to use ${tool.name}. Alph uses your permissions and cannot bypass them.`,
    };
  }

  if (tool.risk === "approval" && ctx.mode !== "act") {
    return {
      ok: false,
      code: "forbidden_write",
      message: "Approval requests are only available in ACT mode.",
    };
  }

  const rl = await defaultRateLimiter.check(
    {
      subject: `user:${ctx.context.userId}`,
      bucket: `alph:tool:${toolId}`,
    },
    SENSITIVE_RATE_LIMITS.alphCommand.limit,
    SENSITIVE_RATE_LIMITS.alphCommand.windowSeconds,
  );

  if (!rl.allowed) {
    appendAlphAudit({
      requestId: ctx.requestId,
      companyId: ctx.context.companyId,
      tenantId: ctx.context.tenantId,
      userId: ctx.context.userId,
      workspace: ctx.context.workspace,
      event: "tool_rate_limited",
      toolId,
      mode: ctx.mode,
    });
    return {
      ok: false,
      code: "rate_limited",
      message: "Too many Alph tool requests. Wait a moment and try again.",
    };
  }

  let parsed: unknown;
  try {
    parsed = tool.validate(input);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid tool input";
    appendAlphAudit({
      requestId: ctx.requestId,
      companyId: ctx.context.companyId,
      tenantId: ctx.context.tenantId,
      userId: ctx.context.userId,
      workspace: ctx.context.workspace,
      event: "tool_validation_failed",
      toolId,
      mode: ctx.mode,
      details: message,
    });
    return { ok: false, code: "validation_error", message };
  }

  appendAlphAudit({
    requestId: ctx.requestId,
    companyId: ctx.context.companyId,
    tenantId: ctx.context.tenantId,
    userId: ctx.context.userId,
    workspace: ctx.context.workspace,
    event: "tool_requested",
    toolId,
    mode: ctx.mode,
  });

  try {
    const result = await tool.execute(parsed, ctx);

    appendAlphAudit({
      requestId: ctx.requestId,
      companyId: ctx.context.companyId,
      tenantId: ctx.context.tenantId,
      userId: ctx.context.userId,
      workspace: ctx.context.workspace,
      event: result.ok ? "tool_executed" : "tool_failed",
      toolId,
      mode: ctx.mode,
      recordsAccessed: result.ok
        ? result.citations.map((c) => `${c.type}:${c.id}`)
        : undefined,
      details: result.ok ? undefined : result.message,
    });

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tool failed";
    appendAlphAudit({
      requestId: ctx.requestId,
      companyId: ctx.context.companyId,
      tenantId: ctx.context.tenantId,
      userId: ctx.context.userId,
      workspace: ctx.context.workspace,
      event: "tool_failed",
      toolId,
      mode: ctx.mode,
      details: message,
    });
    return { ok: false, code: "internal_error", message: "Alph tool failed. Nothing was changed." };
  }
}

export function assertCompanyMatch(
  recordTenantId: string | undefined,
  ctx: AlphToolContext,
  label: string,
): AlphToolExecutionResult | null {
  if (!recordTenantId || recordTenantId !== ctx.context.tenantId) {
    return {
      ok: false,
      code: "tenant_mismatch",
      message: `${label} is not available in your company.`,
    };
  }
  return null;
}

export function clampLimit(
  limit: number | undefined,
  fallback: number,
  max = 25,
): number {
  const n = typeof limit === "number" && Number.isFinite(limit) ? limit : fallback;
  return Math.min(max, Math.max(1, Math.floor(n)));
}

export function requireString(
  value: unknown,
  field: string,
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

export function optionalString(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") throw new Error("Expected string");
  return value.trim();
}

export function optionalNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Expected number");
  }
  return value;
}

/** Ensure ACT mode for approval-creating paths. */
export function requireActMode(mode: AlphMode): void {
  if (mode !== "act") {
    throw new Error("This tool requires ACT mode");
  }
}
