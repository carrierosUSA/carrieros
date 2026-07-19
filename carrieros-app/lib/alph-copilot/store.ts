import {
  DEFAULT_LEARNING_PREFS,
  SEED_ACTIVITY,
  SEED_ALERTS,
  SEED_MEMORY,
} from "@/lib/alph-copilot/seed";
import type {
  CopilotActivityItem,
  CopilotAlert,
  CopilotCommandResult,
  CopilotMemoryItem,
  CopilotPersistedState,
  CopilotRole,
} from "@/lib/alph-copilot/types";
import { sessionRoleToCopilotRole } from "@/lib/alph-copilot/roles";
import type { CarrierOSRole } from "@/lib/auth/session";

const STORAGE_KEY = "transpo.alph-copilot.v1";

let memory: CopilotPersistedState = defaultState("owner");
let hydrated = false;
const listeners = new Set<() => void>();

function defaultState(activeRole: CopilotRole): CopilotPersistedState {
  return {
    activeRole,
    memory: structuredClone(SEED_MEMORY),
    alerts: structuredClone(SEED_ALERTS),
    learningPrefs: { ...DEFAULT_LEARNING_PREFS },
    recentCommands: [],
    activity: structuredClone(SEED_ACTIVITY),
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function hydrate(): void {
  if (hydrated || !canUseStorage()) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<CopilotPersistedState>;
    memory = {
      ...defaultState(parsed.activeRole ?? "owner"),
      ...parsed,
      memory: parsed.memory ?? structuredClone(SEED_MEMORY),
      alerts: parsed.alerts ?? structuredClone(SEED_ALERTS),
      learningPrefs: {
        ...DEFAULT_LEARNING_PREFS,
        ...(parsed.learningPrefs ?? {}),
      },
      recentCommands: parsed.recentCommands ?? [],
      activity: parsed.activity ?? structuredClone(SEED_ACTIVITY),
    };
  } catch {
    // keep defaults
  }
}

function persist(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // ignore quota
  }
}

function emit(): void {
  persist();
  for (const listener of listeners) listener();
}

export function subscribeCopilotStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCopilotSnapshot(): CopilotPersistedState {
  hydrate();
  return memory;
}

export function initCopilotRoleFromSession(
  sessionRole: CarrierOSRole,
): CopilotRole {
  hydrate();
  // Only auto-set when user hasn't overridden (first visit / seed)
  if (!canUseStorage() || !window.localStorage.getItem(STORAGE_KEY)) {
    memory.activeRole = sessionRoleToCopilotRole(sessionRole);
    emit();
  }
  return memory.activeRole;
}

export function getActiveCopilotRole(): CopilotRole {
  hydrate();
  return memory.activeRole;
}

export function setActiveCopilotRole(role: CopilotRole): void {
  hydrate();
  memory.activeRole = role;
  emit();
}

export function listMemory(role?: CopilotRole): CopilotMemoryItem[] {
  hydrate();
  if (!role) return memory.memory;
  return memory.memory.filter((m) => m.role === role);
}

export function upsertMemory(
  item: Omit<CopilotMemoryItem, "updatedAt"> & { updatedAt?: string },
): CopilotMemoryItem[] {
  hydrate();
  const next: CopilotMemoryItem = {
    ...item,
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
  const idx = memory.memory.findIndex((m) => m.id === next.id);
  if (idx >= 0) {
    memory.memory[idx] = next;
  } else {
    memory.memory.unshift(next);
  }
  emit();
  return listMemory(next.role);
}

export function removeMemory(id: string): void {
  hydrate();
  memory.memory = memory.memory.filter((m) => m.id !== id);
  emit();
}

export function clearMemory(role?: CopilotRole): void {
  hydrate();
  memory.memory = role
    ? memory.memory.filter((m) => m.role !== role)
    : [];
  emit();
}

export function listAlerts(options?: {
  role?: CopilotRole;
  includeInactive?: boolean;
}): CopilotAlert[] {
  hydrate();
  const now = Date.now();
  return memory.alerts.filter((alert) => {
    if (options?.role && alert.role !== "all" && alert.role !== options.role) {
      return false;
    }
    if (!options?.includeInactive) {
      if (alert.status === "dismissed" || alert.status === "acted") return false;
      if (alert.status === "snoozed") {
        if (
          alert.snoozeUntil &&
          new Date(alert.snoozeUntil).getTime() > now
        ) {
          return false;
        }
        // snooze expired — treat as active (non-mutating filter)
        return true;
      }
    }
    return true;
  });
}

export function dismissAlert(id: string): void {
  hydrate();
  const alert = memory.alerts.find((a) => a.id === id);
  if (!alert) return;
  alert.status = "dismissed";
  emit();
}

export function snoozeAlert(id: string, hours = 1): void {
  hydrate();
  const alert = memory.alerts.find((a) => a.id === id);
  if (!alert) return;
  alert.status = "snoozed";
  alert.snoozeUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  emit();
}

export function actOnAlert(id: string): CopilotAlert | undefined {
  hydrate();
  const alert = memory.alerts.find((a) => a.id === id);
  if (!alert) return undefined;
  alert.status = "acted";
  pushActivity({
    role: alert.role === "all" ? getActiveCopilotRole() : alert.role,
    title: `Acted: ${alert.title}`,
    detail: alert.body,
    href: alert.actions.find((a) => a.href)?.href,
  });
  emit();
  return alert;
}

export function getLearningPrefs(): Record<string, string | number | boolean> {
  hydrate();
  return { ...memory.learningPrefs };
}

export function setLearningPref(
  key: string,
  value: string | number | boolean,
): void {
  hydrate();
  memory.learningPrefs[key] = value;
  emit();
}

export function pushCommandResult(result: CopilotCommandResult): void {
  hydrate();
  memory.recentCommands = [result, ...memory.recentCommands].slice(0, 20);
  pushActivity({
    role: getActiveCopilotRole(),
    title: result.title,
    detail: result.body,
    href: result.href,
  });
  emit();
}

export function listRecentCommands(): CopilotCommandResult[] {
  hydrate();
  return memory.recentCommands;
}

export function listActivity(role?: CopilotRole): CopilotActivityItem[] {
  hydrate();
  if (!role) return memory.activity;
  return memory.activity.filter((a) => a.role === role);
}

export function pushActivity(
  item: Omit<CopilotActivityItem, "id" | "at"> & { id?: string; at?: string },
): void {
  hydrate();
  memory.activity = [
    {
      id: item.id ?? `act-${Date.now()}`,
      at: item.at ?? new Date().toISOString(),
      role: item.role,
      title: item.title,
      detail: item.detail,
      href: item.href,
    },
    ...memory.activity,
  ].slice(0, 40);
  // caller may emit; for direct use:
  persist();
}

export function resetCopilotStore(role: CopilotRole = "owner"): void {
  memory = defaultState(role);
  hydrated = true;
  emit();
}

/** Optional bridge: summarize proactive alerts for notifications module consumers. */
export function getCopilotNotificationBridge(role?: CopilotRole): Array<{
  id: string;
  title: string;
  body: string;
  severity: CopilotAlert["severity"];
  href?: string;
}> {
  return listAlerts({ role }).map((alert) => ({
    id: `copilot-${alert.id}`,
    title: alert.title,
    body: alert.body,
    severity: alert.severity,
    href: alert.actions.find((a) => a.href)?.href,
  }));
}
