import type { AiActionKind } from "@/lib/ai-safety/confirmation";
import type { ConfidenceLevel } from "@/lib/ai-safety/confidence";

const STORAGE_KEY = "transpo.ai-safety.audit";
const MAX_ENTRIES = 300;

export type AiAuditApproval =
  | "not_required"
  | "pending"
  | "approved"
  | "cancelled"
  | "blocked";

export type AiAuditEntry = {
  id: string;
  at: string;
  user: string;
  actionKind: AiActionKind;
  aiAction: string;
  suggestion: string;
  approval: AiAuditApproval;
  reason?: string;
  confidence?: ConfidenceLevel;
  dataUsed?: string[];
  previousValue?: string;
  newValue?: string;
  source?: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readAll(): AiAuditEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AiAuditEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: AiAuditEntry[]): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_ENTRIES)),
    );
  } catch {
    // Ignore quota / private mode
  }
}

export type AppendAiAuditInput = {
  user?: string;
  actionKind: AiActionKind;
  aiAction: string;
  suggestion: string;
  approval: AiAuditApproval;
  reason?: string;
  confidence?: ConfidenceLevel;
  dataUsed?: string[];
  previousValue?: string;
  newValue?: string;
  source?: string;
};

/** Append-only AI audit log (localStorage). Newest first. */
export function appendAiAudit(input: AppendAiAuditInput): AiAuditEntry {
  const entry: AiAuditEntry = {
    id: `ai-audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    user: input.user ?? "current-user",
    actionKind: input.actionKind,
    aiAction: input.aiAction,
    suggestion: input.suggestion,
    approval: input.approval,
    reason: input.reason,
    confidence: input.confidence,
    dataUsed: input.dataUsed,
    previousValue: input.previousValue,
    newValue: input.newValue,
    source: input.source,
  };

  const next = [entry, ...readAll()].slice(0, MAX_ENTRIES);
  writeAll(next);
  return entry;
}

export function listAiAudit(limit = 50): AiAuditEntry[] {
  return readAll().slice(0, limit);
}

export function clearAiAudit(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
