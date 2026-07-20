import type { DocumentInboxItem } from "@/lib/alph/document-inbox/types";

const items: DocumentInboxItem[] = [];

export function listDocumentInboxItems(filters: {
  tenantId: string;
  companyId: string;
  limit?: number;
}): DocumentInboxItem[] {
  const limit = Math.min(200, Math.max(1, filters.limit ?? 50));
  return items
    .filter(
      (i) =>
        i.tenantId === filters.tenantId && i.companyId === filters.companyId,
    )
    .slice(0, limit);
}

export function getDocumentInboxItem(filters: {
  id: string;
  tenantId: string;
  companyId: string;
}): DocumentInboxItem | null {
  const row = items.find((i) => i.id === filters.id);
  if (!row) return null;
  if (row.tenantId !== filters.tenantId || row.companyId !== filters.companyId) {
    return null;
  }
  return row;
}

export function upsertDocumentInboxItem(item: DocumentInboxItem): DocumentInboxItem {
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.unshift(item);
  }
  return item;
}

export function findDuplicateInboxItem(filters: {
  tenantId: string;
  companyId: string;
  contentFingerprint: string;
  excludeId?: string;
}): DocumentInboxItem | null {
  return (
    items.find(
      (i) =>
        i.tenantId === filters.tenantId &&
        i.companyId === filters.companyId &&
        i.contentFingerprint === filters.contentFingerprint &&
        i.id !== filters.excludeId,
    ) ?? null
  );
}

export function clearDocumentInboxForTests(): void {
  items.length = 0;
}
