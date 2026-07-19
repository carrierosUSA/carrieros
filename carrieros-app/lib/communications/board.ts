import type {
  CommunicationChannel,
  CommunicationRecord,
  CommunicationsFilter,
  CommunicationTimelineEvent,
  EntityType,
  LinkedEntities,
} from "@/lib/communications/types";

function matchesEntityFilter(
  linkedTo: LinkedEntities,
  entityType: EntityType | "all" | undefined,
): boolean {
  if (!entityType || entityType === "all") return true;

  switch (entityType) {
    case "load":
      return Boolean(linkedTo.loadId);
    case "driver":
      return Boolean(linkedTo.driverId);
    case "truck":
      return Boolean(linkedTo.truckId);
    case "trailer":
      return Boolean(linkedTo.trailerId);
    case "broker":
      return Boolean(linkedTo.brokerId);
    case "company":
      return Boolean(linkedTo.companyId);
    default:
      return true;
  }
}

function matchesEntityIds(
  linkedTo: LinkedEntities,
  filter: CommunicationsFilter,
): boolean {
  if (filter.loadId && linkedTo.loadId !== filter.loadId) return false;
  if (filter.driverId && linkedTo.driverId !== filter.driverId) return false;
  if (filter.truckId && linkedTo.truckId !== filter.truckId) return false;
  if (filter.trailerId && linkedTo.trailerId !== filter.trailerId) return false;
  if (filter.brokerId && linkedTo.brokerId !== filter.brokerId) return false;
  if (filter.companyId && linkedTo.companyId !== filter.companyId) return false;
  return true;
}

function searchableText(record: CommunicationRecord): string {
  const parts = [
    record.subject,
    record.body,
    record.preview,
    record.notes,
    record.chatRoom,
    ...record.participants.flatMap((p) => [
      p.name,
      p.phone,
      p.email,
      p.role,
    ]),
    ...(record.messages ?? []).map((m) => `${m.senderName} ${m.body}`),
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function filterCommunications(
  records: CommunicationRecord[],
  filter: CommunicationsFilter = {},
): CommunicationRecord[] {
  const q = (filter.query ?? "").trim().toLowerCase();
  const channel = filter.channel ?? "all";

  return records
    .filter((record) => {
      if (channel !== "all" && record.channel !== channel) return false;
      if (filter.unreadOnly && !record.unread) return false;
      if (!matchesEntityFilter(record.linkedTo, filter.entityType)) return false;
      if (!matchesEntityIds(record.linkedTo, filter)) return false;

      if (filter.dateFrom) {
        if (record.createdAt < filter.dateFrom) return false;
      }
      if (filter.dateTo) {
        if (record.createdAt > `${filter.dateTo}T23:59:59.999Z`) return false;
      }

      if (q && !searchableText(record).includes(q)) return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function filterTimelineEvents(
  events: CommunicationTimelineEvent[],
  filter: CommunicationsFilter = {},
): CommunicationTimelineEvent[] {
  const channel = filter.channel ?? "all";
  const q = (filter.query ?? "").trim().toLowerCase();

  return events
    .filter((event) => {
      if (channel !== "all" && event.channel !== channel) return false;
      if (!matchesEntityFilter(event.linkedTo, filter.entityType)) return false;
      if (!matchesEntityIds(event.linkedTo, filter)) return false;
      if (filter.dateFrom && event.occurredAt < filter.dateFrom) return false;
      if (
        filter.dateTo &&
        event.occurredAt > `${filter.dateTo}T23:59:59.999Z`
      ) {
        return false;
      }
      if (q) {
        const hay = `${event.label} ${event.summary}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
}

export function countByChannel(
  records: CommunicationRecord[],
): Record<CommunicationChannel | "all", number> {
  const counts: Record<CommunicationChannel | "all", number> = {
    all: records.length,
    voice: 0,
    sms: 0,
    email: 0,
    chat: 0,
  };

  for (const record of records) {
    counts[record.channel] += 1;
  }

  return counts;
}

export function countUnread(records: CommunicationRecord[]): number {
  return records.filter((r) => r.unread).length;
}

export function groupSmsThreads(
  records: CommunicationRecord[],
): CommunicationRecord[] {
  return filterCommunications(records, { channel: "sms" });
}

export function groupChatRooms(
  records: CommunicationRecord[],
): CommunicationRecord[] {
  return filterCommunications(records, { channel: "chat" });
}

export function listCallLog(
  records: CommunicationRecord[],
): CommunicationRecord[] {
  return filterCommunications(records, { channel: "voice" });
}

export function listEmails(
  records: CommunicationRecord[],
): CommunicationRecord[] {
  return filterCommunications(records, { channel: "email" });
}
