import type {
  AlphAuditAppendInput,
  AlphAuditEntry,
} from "@/lib/alph/audit/types";

const MAX_ENTRIES = 2_000;

/** Process-memory audit store — company-isolated queries. Swap for Postgres later. */
const entries: AlphAuditEntry[] = [];

function newId(): string {
  return `alph_aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Mask obvious secret-looking tokens in free text. */
export function maskSensitiveText(text: string, maxLen = 2_000): string {
  let out = text
    .replace(/(api[_-]?key|secret|password|token)\s*[:=]\s*\S+/gi, "$1=[REDACTED]")
    .replace(/\bsk-[a-zA-Z0-9]{10,}\b/g, "[REDACTED]")
    .replace(/\bBearer\s+[A-Za-z0-9._\-]+\b/gi, "Bearer [REDACTED]");
  if (out.length > maxLen) out = `${out.slice(0, maxLen)}…`;
  return out;
}

export function appendAlphAudit(input: AlphAuditAppendInput): AlphAuditEntry {
  const entry: AlphAuditEntry = {
    ...input,
    id: input.id ?? newId(),
    at: input.at ?? new Date().toISOString(),
    prompt: input.prompt ? maskSensitiveText(input.prompt) : undefined,
    details: input.details ? maskSensitiveText(input.details, 1_000) : undefined,
  };
  entries.unshift(entry);
  if (entries.length > MAX_ENTRIES) {
    entries.length = MAX_ENTRIES;
  }
  return entry;
}

export function listAlphAudit(filters: {
  companyId: string;
  tenantId: string;
  userId?: string;
  requestId?: string;
  limit?: number;
}): AlphAuditEntry[] {
  const limit = Math.min(200, Math.max(1, filters.limit ?? 50));
  return entries
    .filter(
      (e) =>
        e.companyId === filters.companyId &&
        e.tenantId === filters.tenantId &&
        (!filters.userId || e.userId === filters.userId) &&
        (!filters.requestId || e.requestId === filters.requestId),
    )
    .slice(0, limit);
}

export function clearAlphAuditForTests(): void {
  entries.length = 0;
}
