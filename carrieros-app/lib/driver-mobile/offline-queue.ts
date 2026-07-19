import type { OfflineActionType, OfflineQueueItem } from "@/lib/driver-mobile/types";

const STORAGE_KEY = "carrieros.driver.offlineQueue";

function id() {
  return `oq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readOfflineQueue(): OfflineQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineQueueItem[];
  } catch {
    return [];
  }
}

export function writeOfflineQueue(items: OfflineQueueItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function enqueueOfflineAction(
  type: OfflineActionType,
  label: string,
  payload: Record<string, unknown> = {},
): OfflineQueueItem {
  const item: OfflineQueueItem = {
    id: id(),
    type,
    label,
    payload,
    createdAt: new Date().toISOString(),
    status: "queued",
  };
  const next = [item, ...readOfflineQueue()];
  writeOfflineQueue(next);
  return item;
}

export function clearOfflineQueue() {
  writeOfflineQueue([]);
}

/** Stub sync — marks items synced and clears after a short delay. */
export async function syncOfflineQueue(
  onProgress?: (remaining: OfflineQueueItem[]) => void,
): Promise<{ synced: number }> {
  const items = readOfflineQueue();
  if (items.length === 0) return { synced: 0 };

  const syncing = items.map((i) => ({ ...i, status: "syncing" as const }));
  writeOfflineQueue(syncing);
  onProgress?.(syncing);

  await new Promise((r) => setTimeout(r, 900));
  clearOfflineQueue();
  onProgress?.([]);
  return { synced: items.length };
}
