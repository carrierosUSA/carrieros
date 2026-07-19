import type { AlphCommand } from "@/lib/alph/types";

const STORAGE_KEY = "carrieros.alph.history";
const MAX_HISTORY = 20;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function listAlphHistory(): AlphCommand[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as AlphCommand[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

export function pushAlphHistory(entry: Omit<AlphCommand, "id" | "ranAt"> & {
  id?: string;
  ranAt?: string;
}): AlphCommand[] {
  if (!canUseStorage()) {
    return [];
  }

  const nextEntry: AlphCommand = {
    id: entry.id ?? `alph-${Date.now()}`,
    text: entry.text.trim(),
    ranAt: entry.ranAt ?? new Date().toISOString(),
    resultTitle: entry.resultTitle,
  };

  if (!nextEntry.text) {
    return listAlphHistory();
  }

  const previous = listAlphHistory().filter(
    (item) => item.text.toLowerCase() !== nextEntry.text.toLowerCase(),
  );
  const next = [nextEntry, ...previous].slice(0, MAX_HISTORY);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private mode failures
  }

  return next;
}

export function clearAlphHistory(): void {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
